![SpoTUI animation](banner-gif.gif)

# SpoTUI

SpoTUI is a terminal-style Spotify skin built for Spicetify.

It combines:
- a custom UI overlay in `theme.js`
- theme styling in `user.css`
- Spotify color values in `color.ini`

## Screenshot

![SpoTUI preview](preview.png)
## Features

- Terminal-inspired interface
- Built-in playback controls
- Track search without leaving the terminal
- Playlist browsing and management
- Six color schemes, followed by both the terminal and the Spotify UI
- Command history with the arrow keys
- Spotify-native fallback mode
- Copy-log and hide/show controls

## Installation

<details>
<summary>Linux</summary>

1. Open a terminal.
2. Go to your Spicetify themes directory:
   ```bash
   cd ~/.config/spicetify/Themes
   ```
3. Clone or pull this repo into that folder:
   ```bash
   git clone https://github.com/SouRyan/SpoTUI SpoTUI
   ```
   If you already have it locally, update it instead:
   ```bash
   cd SpoTUI
   git pull
   ```
4. Set SpoTUI as your current theme:
   ```bash
   spicetify config current_theme SpoTUI
   ```
5. Apply Spicetify:
   ```bash
   spicetify apply
   ```

</details>

<details>
<summary>Windows</summary>

1. Open PowerShell or Command Prompt.
2. Go to your Spicetify themes directory:
   ```powershell
   cd $env:APPDATA\spicetify\Themes
   ```
3. Clone or pull this repo into that folder:
   ```powershell
   git clone https://github.com/SouRyan/SpoTUI SpoTUI
   ```
   If you already have it locally, update it instead:
   ```powershell
   cd SpoTUI
   git pull
   ```
4. Set SpoTUI as your current theme:
   ```powershell
   spicetify config current_theme SpoTUI
   ```
5. Apply Spicetify:
   ```powershell
   spicetify apply
   ```

</details>
<details>
<summary>Marketplace</summary>

1. Open Spotify.
2. Go to the Spicetify Marketplace.
3. Select themes and search `SpoTUI`.
4. The only result will be the SpoTUI theme.

</details>

## Usage

After applying the theme, open Spotify and use the SpoTUI interface directly from the client.
Commands can be typed bare or prefixed with `/` or `.`. Use the arrow keys to walk through
your command history, and `help` to open the command list in-app.

### Playback

| Command | Description |
| --- | --- |
| `play` / `pause` / `p` | resume, pause, or toggle |
| `skip` / `back` | next or previous track |
| `seek <pos>` | `mm:ss`, seconds, `50%`, `+15` or `-15` |
| `v <0-100>` / `volume <0-100>` | set volume |
| `shuffle` | toggle shuffle |
| `loop [on\|off]` | repeat the whole context |
| `superloop [on\|off]` | repeat the current track |
| `sleep <min\|off>` | pause playback after N minutes |

### Library and browsing

| Command | Description |
| --- | --- |
| `search <terms>` | search tracks in a popup; no terms opens the Spotify search |
| `add <terms>` | queue the top search result |
| `playlist` | browse your playlists |
| `list` | tracks of the playlist currently playing |
| `queue` | current queue |
| `like` / `unlike` | save or remove the current track |
| `np` / `info` | show what is playing, with progress bar |
| `lyrics` | toggle the lyrics panel |

### Interface

| Command | Description |
| --- | --- |
| `theme [name\|auto]` | switch color scheme; no name opens the picker |
| `bg <url\|off>` | image or GIF behind the logo screen |
| `tui -m [command\|cli]` | hide or show the command log |
| `clear` | clear the log |
| `help [category\|command]` | browse commands by category |

`help` opens a category list mirroring the three tables above. Arrows move, `Enter` enters a
category, `Esc` goes back one level and then closes. You can also jump straight in with
`help library` or `help seek`.

In the playlist, queue and search popups: arrow keys move, `Enter` plays, `a` adds to the
queue, `n` creates a playlist (playlist list only), and `Esc` closes.

## Backdrop

`bg` puts an image or animated GIF behind the ASCII logo. It only shows on the logo screen,
so switching to `tui -m cli` leaves the log on a plain background and readable.

```
bg https://example.com/loop.gif    set it
bg opacity 60                      how strongly it shows through (default 35)
bg                                 show what is set
bg off                             remove it
```

Only `http` and `https` URLs are accepted, and the image is loaded once before being applied,
so a broken link reports an error instead of leaving you with a blank backdrop. The URL and
opacity are saved, so the backdrop comes back when Spotify restarts.

## Color Schemes

SpoTUI ships with `SpoTUI - SkenS` (orange, default), `Matrix`, `Dracula`, `Gruvbox`,
`Nord` and `Mono`.

The quickest way to switch is the `theme` command, which repaints everything instantly and
remembers your choice:

```
theme nord          switch to Nord
theme               open the picker, arrows preview live, Enter keeps
theme auto          go back to following the Spicetify scheme
```

You can also switch through Spicetify itself, which additionally recolors the parts of the
Spotify client that SpoTUI does not style, at the cost of a restart:

```bash
spicetify config color_scheme Nord
spicetify apply
```

Adding a scheme means editing two places: a section in `color.ini` (for Spicetify and the
Marketplace) and an entry in `SPOTUI_SCHEMES` in `theme.js` (for the `theme` command).

## Theme Files

- `theme.js` - JavaScript UI logic
- `user.css` - Spotify UI styling overrides
- `color.ini` - theme colors
- `preview.png` - Marketplace preview image

## Authors

- SouRyan - https://github.com/SouRyan (this fork)
- SkenS - https://github.com/SkenSMasteR (original)
