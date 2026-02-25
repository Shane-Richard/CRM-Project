import abc
from datetime import datetime
from typing import List, Dict, Any

# --- Decorators for Logging and Security ---

def log_operation(func):
    """DRY: Reusable decorator to log module operations."""
    def wrapper(self, *args, **kwargs):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Executing {func.__name__} on {self.module_name}...")
        return func(self, *args, **kwargs)
    return wrapper

# --- Base Architecture ---

class UniversalModule(abc.ABC):
    """
    Base class for all vehicle modules.
    Follows the Interface Segregation and Dependency Inversion principles.
    """
    def __init__(self, module_name: str):
        self.module_name = module_name
        self.is_active = False

    @abc.abstractmethod
    def initialize(self):
        """Must be implemented by any specific submodule."""
        pass

    def toggle_power(self, state: bool):
        self.is_active = state
        print(f"Module '{self.module_name}' power set to: {state}")

# --- Mixins for Reusable Functionality (DRY) ---

class SelfDiagnosticMixin:
    """Provides self-diagnostic capabilities to any module."""
    def run_diagnostics(self):
        print(f"[DIAGNOSTIC] Running system check for {self.module_name}...")
        # Simulate check
        return {"status": "OK", "temp": 42.0}

# --- Specialized Subclasses ---

class AntigravityPropulsion(UniversalModule, SelfDiagnosticMixin):
    """
    Specialized module for Quantum Levitation.
    """
    def __init__(self):
        super().__init__("Antigravity_Propulsion_v2")
        self.field_strength = 0.0

    def initialize(self):
        print("Stabilizing toroid electromagnetic fields...")
        self.toggle_power(True)

    @log_operation
    def adjust_levitation(self, level: float):
        self.field_strength = level
        print(f"Field set to: {self.field_strength} G-units.")

class BusCoreLogic(UniversalModule, SelfDiagnosticMixin):
    """
    Handles internal bus systems and routing logic.
    """
    def __init__(self):
        super().__init__("Bus_Core_Logic")
        self.route_data = []

    def initialize(self):
        print("Loading global navigation manifests...")
        self.toggle_power(True)

    @log_operation
    def plan_route(self, destination: str):
        print(f"Calculating quantum path to {destination}...")
        self.route_data.append(destination)

# --- The Extensible Vehicle Container ---

class FutureVehicle:
    """
    The main vehicle class. 
    Uses a 'Module Registry' pattern to allow adding new modules (Shields, Autopilot)
    without modifying this class or the base modules. (Open/Closed Principle)
    """
    def __init__(self, vin: str):
        self.vin = vin
        self.modules: Dict[str, UniversalModule] = {}

    def install_module(self, module: UniversalModule):
        """Allows dynamic attachment of new features."""
        print(f"INSTALLING MODULE: {module.module_name}")
        module.initialize()
        self.modules[module.module_name] = module

    def get_module(self, name_segment: str):
        """Retrieves a module based on part of its name."""
        for name, mod in self.modules.items():
            if name_segment.lower() in name.lower():
                return mod
        return None

# --- Demonstrating Extensibility (Adding new features without touching base code) ---

class ShieldModule(UniversalModule, SelfDiagnosticMixin):
    """Added later without modifying UniversalModule or FutureVehicle."""
    def __init__(self):
        super().__init__("Plasma_Shielding")
        self.integrity = 100

    def initialize(self):
        print("Projecting ion-barrier...")
        self.toggle_power(True)

    def status(self):
        print(f"Shield Integrity: {self.integrity}%")

# --- EXECUTION ---

if __name__ == "__main__":
    # 1. Create the Vehicle
    my_bus = FutureVehicle(vin="TXB-001-QUANTUM")

    # 2. Add Core Modules
    propulsion = AntigravityPropulsion()
    logic = BusCoreLogic()

    my_bus.install_module(propulsion)
    my_bus.install_module(logic)

    # 3. Add a NEW feature (Shields) dynamically
    shields = ShieldModule()
    my_bus.install_module(shields)

    # 4. Interact with modules
    print("\n--- OPERATIONAL LOGS ---")
    my_bus.get_module("Antigravity").adjust_levitation(0.85)
    my_bus.get_module("Core").plan_route("Mars Station Alpha")
    
    # Run diagnostcs via Mixin
    diag = my_bus.get_module("Shielding").run_diagnostics()
    print(f"Shield Check: {diag}")
