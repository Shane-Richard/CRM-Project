import { ENV } from './envConfig';

export const GOOGLE_CONFIG = {
    clientId: ENV.GOOGLE.CLIENT_ID,
    redirectUri: ENV.GOOGLE.REDIRECT_URI,
    scopes: [
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' ')
};

export const IMAP_PRESETS = {
    'gmail.com': {
        imap: { host: 'imap.gmail.com', port: 993, secure: true },
        smtp: { host: 'smtp.gmail.com', port: 465, secure: true }
    },
    'outlook.com': {
        imap: { host: 'outlook.office365.com', port: 993, secure: true },
        smtp: { host: 'smtp.office365.com', port: 587, secure: false }
    },
    'yahoo.com': {
        imap: { host: 'imap.mail.yahoo.com', port: 993, secure: true },
        smtp: { host: 'smtp.mail.yahoo.com', port: 465, secure: true }
    }
};

export const getAutoConfig = (email) => {
    const domain = email.split('@')[1]?.toLowerCase();
    return IMAP_PRESETS[domain] || null;
};
