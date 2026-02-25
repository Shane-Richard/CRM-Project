import React from 'react';
import { Filter, ArrowUpDown, Plus, Inbox } from 'lucide-react';
import DataTable from './common/DataTable';
import { PrimaryButton, SecondaryButton, SearchInput, StatusBadge } from './ui';

const InboxPlacement = ({ tests = [], isLoading = false, onAddTest }) => {
    
    // Define columns for the DataTable
    const columns = [
        { key: 'name', title: 'Test Name', className: 'font-medium text-gray-900' },
        { 
            key: 'status', 
            title: 'Status', 
            render: (row) => <StatusBadge status={row.status} />
        },
        { key: 'score', title: 'Placement Score', render: (row) => (
            <div className="flex items-center">
                <span className="font-bold mr-2">{row.score}%</span>
                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${row.score}%` }}></div>
                </div>
            </div>
        )},
        { key: 'date', title: 'Date Created' },
    ];

    return (
        <div className="flex flex-col h-full fade-in">
            {/* Toolbar Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                {/* Search */}
                <div className="relative w-full md:w-96">
                    <SearchInput placeholder="Search..." />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Filter */}
                    <SecondaryButton>
                        <Filter className="w-4 h-4" />
                        <span>All statuses</span>
                    </SecondaryButton>

                    {/* Sort */}
                    <SecondaryButton>
                        <ArrowUpDown className="w-4 h-4" />
                        <span>Newest first</span>
                    </SecondaryButton>

                    {/* Add New Button */}
                    <PrimaryButton onClick={onAddTest}>
                        <Plus className="w-5 h-5" strokeWidth={3} />
                        <span>Add New</span>
                    </PrimaryButton>
                </div>
            </div>

            {/* Content Section: DataTable or Empty State */}
            {tests.length > 0 || isLoading ? (
                <div className="flex-1">
                    <DataTable 
                        columns={columns} 
                        data={tests} 
                        isLoading={isLoading} 
                        onRowClick={(row) => console.log('Row clicked:', row)}
                    />
                </div>
            ) : (
                /* Empty State Section */
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                    <div className="max-w-md text-center">
                        {/* Illustration Placeholder */}
                        <div className="mb-8 relative inline-block">
                            <div className="w-48 h-48 bg-gray-50 rounded-full flex items-center justify-center relative overflow-hidden">
                                 <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                    <Inbox className="w-32 h-32 text-gray-300" />
                                 </div>
                                 <svg viewBox="0 0 24 24" className="w-24 h-24 text-gray-800 relative z-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="4" y="4" width="16" height="16" rx="2" className="text-gray-400" strokeDasharray="4 4" />
                                    <path d="M9 3v18" className="text-gray-300" />
                                    <path d="M15 3v18" className="text-gray-300" />
                                    <path d="M9 12h6" />
                                    <circle cx="12" cy="12" r="3" className="fill-primary stroke-none opacity-50" />
                                    <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                                 </svg>
                            </div>
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-6 h-6 bg-primary rounded-full animate-bounce delay-100"></div>
                            <div className="absolute bottom-4 left-4 w-3 h-3 bg-gray-300 rounded-full"></div>
                        </div>

                        <h3 className="text-xl font-bold text-text mb-2">Add a new test to get started</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                            Launch a new inbox placement test to see where your emails are landing.
                        </p>

                        <button 
                            onClick={onAddTest}
                            className="inline-flex items-center gap-2 text-primary hover:text-lime-600 font-bold hover:underline transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add New
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InboxPlacement;
