'use strict';

const { Adw, Gio, GLib, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const { ThemeSettings } = Me.imports.settings;

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
    const themes = Array.from([
        GLib.build_filenamev([GLib.get_home_dir(), '.themes']),
        GLib.build_filenamev([GLib.get_user_data_dir(), 'themes']),
        ...GLib.get_system_data_dirs().map(path => GLib.build_filenamev([path, 'themes']))
    ].reduce(_addTheme, new Set()));
    const stringList = Gtk.StringList.new(themes);
    
    // Add the ui file
    builder.add_from_file(`${Me.path}/ui/main.xml`);
    
    // Add the general settings
    window.add(builder.get_object('general'));

    // Bind settings to widgets
    ThemeSettings.getKeys().forEach(key => {
        const widget = builder.get_object(key.replaceAll('-', '_'));
        widget.set_model(stringList);
        widget.selected = themes.indexOf(themeSettings.get_string(key));
        widget.connect('notify::selected', () => themeSettings.set_string(key, themes[widget.selected]));
    });
}

/**
 * Add all themes under the path 
 * 
 * @param {Set<string>} themes 
 * @param {string} path 
 * @returns {Set<string>} Themes 
 */
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