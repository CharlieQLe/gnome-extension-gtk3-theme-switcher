'use strict';

const { Adw, Gio, GLib, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const { ThemeSettings, getThemes } = Me.imports.common;

/**
 * Like `extension.js` this is used for any one-time setup like translations.
 *
 * @param {ExtensionMeta} meta - An extension meta object, described below.
 */
function init(meta) { }

/**
 * This function is called when the preferences window is first created to fill
 * the `Adw.PreferencesWindow`.
 *
 * This function will only be called by GNOME 42 and later. If this function is
 * present, `buildPrefsWidget()` will never be called.
 *
 * @param {Adw.PreferencesWindow} window - The preferences window
 */
function fillPreferencesWindow(window) {
    const themeSettings = ThemeSettings.getNewSchema();
    const builder = new Gtk.Builder();

    // Get themes
    const themes = Array.from(getThemes());
    const stringList = Gtk.StringList.new(themes);
    
    // Add the ui file
    builder.add_from_file(`${Me.path}/ui/main.xml`);
    
    // Add the general settings
    window.add(builder.get_object('general'));

    // Bind settings to switches
    ThemeSettings.getKeys().forEach(key => {
        const widget = builder.get_object(key.replaceAll('-', '_'));
        widget.set_model(stringList);
        widget.selected = themes.indexOf(themeSettings.get_string(key));
        widget.connect('notify::selected', () => themeSettings.set_string(key, themes[widget.selected]));
    });
}