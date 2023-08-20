import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk';

import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import { ThemeSettings } from './settings.js';

export default class Gtk3ThemeSwitcherPreferences extends ExtensionPreferences {
    /**
     * This function is called when the preferences window is first created to fill
     * the `Adw.PreferencesWindow`.
     *
     * @param {Adw.PreferencesWindow} window - The preferences window
     */

    fillPreferencesWindow(window) {
        const themeSettings = this.getSettings();
        const builder = new Gtk.Builder();
        window.set_default_size(360, 206);

        // Get themes
        const themes = Array.from([
            GLib.build_filenamev([GLib.get_home_dir(), '.themes']),
            GLib.build_filenamev([GLib.get_user_data_dir(), 'themes']),
            ...GLib.get_system_data_dirs().map(path => GLib.build_filenamev([path, 'themes']))
        ].reduce(this._addTheme, new Set()));
        const stringList = Gtk.StringList.new(themes);

        // Add the ui file
        builder.add_from_file(`${this.path}/ui/main.xml`);

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
    _addTheme(themes, path) {
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
}
