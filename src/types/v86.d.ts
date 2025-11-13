declare module 'v86' {
  export interface V86Config {
    // Memory
    memory_size?: number;
    vga_memory_size?: number;

    // Boot
    boot_order?: number;
    fastboot?: boolean;

    // Features
    acpi?: boolean;
    disable_jit?: boolean;
    disable_mouse?: boolean;
    disable_keyboard?: boolean;
    disable_speaker?: boolean;

    // BIOS
    bios?: { url: string } | ArrayBuffer;
    vga_bios?: { url: string } | ArrayBuffer;

    // Storage
    cdrom?: { url: string } | ArrayBuffer;
    hda?: { url: string } | ArrayBuffer;
    hdb?: { url: string } | ArrayBuffer;
    fda?: { url: string } | ArrayBuffer;
    fdb?: { url: string } | ArrayBuffer;

    // Initial state
    initial_state?: { url: string } | ArrayBuffer;

    // Display
    screen_container?: HTMLElement;
    screen_scale?: number;

    // Network
    network_relay_url?: string;

    // Filesystem
    //filesystem?: any;

    // Behavior
    autostart?: boolean;
    wasm_path?: string;
    log_level?: number;
  }

  export interface DownloadProgress {
    file_index: number;
    file_count: number;
    file_name: string;
    lengthComputable: boolean;
    total: number;
    loaded: number;
  }

  export interface V86Starter {
    // Lifecycle
    destroy(): void;
    run(): void;
    stop(): Promise<void>;
    restart(): void;

    // Events
    /* eslint-disable */
    add_listener(event: string, callback: Function): void;
    remove_listener(event: string, callback: Function): void;
    /* eslint-enable */

    // Input
    keyboard_send_text(text: string, delay?: number): Promise<void>;
    keyboard_send_scancodes(codes: number[], delay?: number): Promise<void>;
    keyboard_set_enabled(enabled: boolean): void;

    // Mouse
    mouse_set_enabled(enabled: boolean): void;
    lock_mouse(): Promise<void>;

    // Storage
    set_cdrom(file: { url: string } | ArrayBuffer): Promise<void>;
    eject_cdrom(): void;
    set_fda(file: { url: string } | ArrayBuffer): Promise<void>;
    set_fdb(file: { url: string } | ArrayBuffer): Promise<void>;
    eject_fda(): void;
    eject_fdb(): void;

    // Screen
    screen_make_screenshot(): HTMLImageElement | null;
    screen_set_scale(sx: number, sy: number): void;
    screen_go_fullscreen(): void;

    // Serial
    serial0_send(data: string): void;
    serial_send_bytes(serial: number, data: Uint8Array): void;

    // State
    save_state(): Promise<ArrayBuffer>;
    restore_state(state: ArrayBuffer): Promise<void>;

    // Memory
    read_memory(offset: number, length: number): Uint8Array;
    write_memory(blob: Uint8Array | number[], offset: number): void;

    // Status
    is_running(): boolean;
    get_instruction_counter(): number;

    // Filesystem (if available)
    create_file?(file: string, data: Uint8Array): Promise<void>;
    read_file?(file: string): Promise<Uint8Array>;

    // Utilities
    wait_until_vga_screen_contains(
      expected: string | RegExp | Array<string | RegExp>,
      options?: { timeout_msec?: number }
    ): Promise<boolean>;
  }

  const V86: {
    new (config: V86Config): V86Starter;
  };

  export default V86;
}
