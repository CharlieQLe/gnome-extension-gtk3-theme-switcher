#!/bin/bash

EXTENSION_PATH="$HOME/.local/share/gnome-shell/extensions/gtk3-theme-switcher@charlieqle"

rm -r "$EXTENSION_PATH" 2> /dev/null
glib-compile-schemas "./src/schemas/"
cp -r "./src" "$EXTENSION_PATH" && echo "Log out and log back in to load extension!"