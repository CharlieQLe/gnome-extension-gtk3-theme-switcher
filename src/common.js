'use strict';

const { Gio, GLib, Gtk } = imports.gi;

var Settings = class Settings {
    constructor(schema) {
        this._schema = schema;
    }

    destroy() {
        this._schema.run_dispose();
        this._schema = null;
    }

    get schema() { 
        return this._schema;
    }

    onChanged(key, func) { 
        this._schema.connect(`changed::${key}`, func); 
    }

    getBoolean(key) { 
        return this._schema.get_boolean(key); 
    }

    setBoolean(key, value) { 
        this._schema.set_boolean(key, value); 
    }

    getString(key) { 
        return this._schema.get_string(key); 
    }

    setString(key, value) { 
        this._schema.set_string(key, value); 
    }
}

/**
 * Handles settings for this extension.
 */
var ThemeSettings = class ThemeSettings extends Settings {
    static LIGHT_THEME_NAME = "light";
    static DARK_THEME_NAME = "dark";

    static getNewSchema() {
        const extensionUtils = imports.misc.extensionUtils;
        return extensionUtils.getSettings(extensionUtils.getCurrentExtension().metadata['settings-schema']);
    }

    static getKeys() {
        return [
            this.LIGHT_THEME_NAME,
            this.DARK_THEME_NAME
        ];
    }
    
    constructor() { 
        super(ThemeSettings.getNewSchema()); 
    }

    get lightThemeName() {
        return this.getString(ThemeSettings.LIGHT_THEME_NAME);
    }

    set lightThemeName(name) {
        this.setString(ThemeSettings.LIGHT_THEME_NAME, name);
    }

    get darkThemeName() {
        return this.getString(ThemeSettings.DARK_THEME_NAME);
    }

    set darkThemeName(name) {
        this.setString(ThemeSettings.DARK_THEME_NAME, name);
    }

    onChangedLightThemeName(func) {
        this.onChanged(ThemeSettings.LIGHT_THEME_NAME, func);
    }

    onChangedDarkThemeName(func) {
        this.onChanged(ThemeSettings.DARK_THEME_NAME, func);
    }
}

/**
 * Handles settings for the desktop interface.
 */
var InterfaceSettings = class InterfaceSettings extends Settings {
    static COLOR_SCHEME = "color-scheme";
    static GTK_THEME = "gtk-theme";
    
    static getNewSchema() {
        return new Gio.Settings({ schema: 'org.gnome.desktop.interface' });
    }

    constructor() {
        super(InterfaceSettings.getNewSchema());
    }

    get colorScheme() {
        return this.getString(InterfaceSettings.COLOR_SCHEME);
    }
    
    get gtkTheme() {
        return this.getString(InterfaceSettings.GTK_THEME);
    }

    set gtkTheme(theme) {
        return this.setString(InterfaceSettings.GTK_THEME, theme);
    }

    onChangedColorScheme(func) {
        this.onChanged(InterfaceSettings.COLOR_SCHEME, func);
    }
}

function _addTheme(themes, path) {
    const resourceDir = Gio.File.new_for_path(path);
    if (resourceDir.query_file_type(Gio.FileQueryInfoFlags.NONE, null) !== Gio.FileType.DIRECTORY) return themes;
    const enumerator = resourceDir.enumerate_children('standard::', Gio.FileQueryInfoFlags.NONE, null);
    while (true) {
        const info = enumerator.next_file(null);
        if (info === null) break;
        const dir = enumerator.get_child(info);
        if (dir === null) continue;
        const version = [0, Gtk.MINOR_VERSION].find(gtkVersion => {
            if (gtkVersion % 2) gtkVersion++;
            return Gio.File.new_for_path(GLib.build_filenamev([dir.get_path(), `gtk-3.${gtkVersion}`, 'gtk.css'])).query_exists(null);
        });
        if (version !== undefined) themes.add(dir.get_basename());
    }
    enumerator.close(null);
    return themes;
}

function getThemes() {
    return [
        GLib.build_filenamev([GLib.get_home_dir(), '.themes']),
        GLib.build_filenamev([GLib.get_user_data_dir(), 'themes']),
        ...GLib.get_system_data_dirs().map(path => GLib.build_filenamev([path, 'themes']))
    ].reduce(_addTheme, new Set());
}