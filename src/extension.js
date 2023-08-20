/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { ThemeSettings, InterfaceSettings } from './settings.js';

export default class Gtk3ThemeSwitcher extends Extension {
    enable() {
        // Create settings
        this._themeSettings = new ThemeSettings(this.getSettings());
        this._interfaceSettings = new InterfaceSettings();

        // Connect signals
        this._themeSettings.onChangedLightThemeName(this._updateTheme.bind(this));
        this._themeSettings.onChangedDarkThemeName(this._updateTheme.bind(this));
        this._interfaceSettings.onChangedColorScheme(this._updateTheme.bind(this));
    }

    disable() {
        this._themeSettings = null;
        this._interfaceSettings = null;
    }

    _updateTheme() {
        const mode = this._interfaceSettings.colorScheme;
        if (mode === 'default') this._setTheme(this._themeSettings.lightThemeName);
        else if (mode === 'prefer-dark') this._setTheme(this._themeSettings.darkThemeName);
    }

    _setTheme(themeName) {
        const gtk_theme = this._interfaceSettings.gtkTheme;
        if (gtk_theme === themeName) return;
        this._interfaceSettings.gtkTheme = themeName;
    }
}
