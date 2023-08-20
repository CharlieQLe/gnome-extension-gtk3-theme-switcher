import Gio from 'gi://Gio';

class Settings {
    constructor(schema) {
        this._schema = schema;
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
export class ThemeSettings extends Settings {
    static LIGHT_THEME_NAME = "light";
    static DARK_THEME_NAME = "dark";

    static getKeys() {
        return [
            this.LIGHT_THEME_NAME,
            this.DARK_THEME_NAME
        ];
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
export class InterfaceSettings extends Settings {
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
