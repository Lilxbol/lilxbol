class MusicPlayer {
    constructor(parentId) {
        if (!parentId) throw "Missing parameters";

        const path = require("path");
        const remote = require("@electron/remote");

        // Resolve music folder (settings.json: "musicDir")
        this.folder = window.settings.musicDir || path.join(remote.app.getPath("userData"), "Music");
        const fs = require("fs");
        if (!fs.existsSync(this.folder)) {
            fs.mkdirSync(this.folder, { recursive: true });
        }

        this.audioExtensions = [".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac", ".opus", ".webm"];
        this.tracks = [];
        this.current = -1;
        this.audio = new Audio();
        this.audio.volume = 0.8;
        this.playing = false;
        this.seekDrag = false;

        // Create DOM
        this.parent = document.getElementById(parentId);
        this.parent.innerHTML += `<div id="mod_musicplayer">
            <h1>MUSIC PLAYER<i id="mod_mp_count"></i></h1>
            <div id="mod_mp_list"></div>
            <div id="mod_mp_now">
                <div id="mod_mp_title">No tracks yet</div>
                <div id="mod_mp_time">--:-- / --:--</div>
            </div>
            <div id="mod_mp_progress"><div id="mod_mp_progressbar"></div></div>
            <div id="mod_mp_controls">
                <span id="mod_mp_prev">&#9664;&#9664;</span>
                <span id="mod_mp_playpause">&#9654;</span>
                <span id="mod_mp_next">&#9654;&#9654;</span>
            </div>
            <div id="mod_mp_folder" title="Drop audio files in this folder">${this.folder.replace(/"/g, "")}</div>
        </div>`;

        this.listElement = document.getElementById("mod_mp_list");
        this.titleElement = document.getElementById("mod_mp_title");
        this.timeElement = document.getElementById("mod_mp_time");
        this.progressElement = document.getElementById("mod_mp_progress");
        this.barElement = document.getElementById("mod_mp_progressbar");
        this.playPauseElement = document.getElementById("mod_mp_playpause");

        // Wire controls
        document.getElementById("mod_mp_prev").addEventListener("click", () => this.previous());
        document.getElementById("mod_mp_next").addEventListener("click", () => this.next());
        this.playPauseElement.addEventListener("click", () => this.toggle());
        this.progressElement.addEventListener("click", (e) => {
            const rect = this.progressElement.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            if (this.audio.duration) this.audio.currentTime = ratio * this.audio.duration;
        });

        this.audio.addEventListener("ended", () => this.next(true));
        this.audio.addEventListener("timeupdate", () => this.updateProgress());

        // Scan now, then every 10s (picks up new dropped files)
        this.scan();
        this.updater = setInterval(() => this.scan(), 10000);
    }

    scan() {
        const fs = require("fs");
        let files = [];
        try {
            files = fs.readdirSync(this.folder);
        } catch (e) {
            return;
        }
        const tracks = files.filter(f => this.audioExtensions.includes(require("path").extname(f).toLowerCase())).sort();
        const changed = (tracks.length !== this.tracks.length) || tracks.some((t, i) => t !== this.tracks[i]);
        this.tracks = tracks;
        document.getElementById("mod_mp_count").textContent = tracks.length ? ` (${tracks.length})` : "";
        if (changed) this.renderList();
    }

    renderList() {
        this.listElement.innerHTML = "";
        if (!this.tracks.length) {
            this.titleElement.textContent = "Drop audio files in the folder";
            this.titleElement.style.color = "rgba(var(--color_r), var(--color_g), var(--color_b), 0.5)";
            return;
        }
        this.tracks.forEach((track, i) => {
            const item = document.createElement("div");
            item.className = "mod_mp_track" + (i === this.current ? " mod_mp_active" : "");
            item.textContent = track.replace(/\.[^.]+$/, "");
            item.title = track;
            item.addEventListener("click", () => this.play(i));
            this.listElement.appendChild(item);
        });
    }

    play(index) {
        if (index < 0 || index >= this.tracks.length) return;
        this.current = index;
        const file = require("path").join(this.folder, this.tracks[index]);
        // Same source mechanism as the file-manager media modal (proven to work):
        // plain path resolved against the file:// page origin, no file:// scheme here.
        this.audio.pause();
        this.audio.removeAttribute("src");
        this.audio.innerHTML = "";
        const source = document.createElement("source");
        source.src = window._encodePathURI(file);
        this.audio.appendChild(source);
        this.audio.load();
        this.audio.onerror = () => {
            this.titleElement.textContent = "Cannot decode this file";
            this.titleElement.style.color = "#ff5555";
            this.playing = false;
            this.playPauseElement.innerHTML = "&#9654;";
        };
        this.audio.play().catch(err => {
            this.titleElement.textContent = "Cannot play: " + (err && err.message ? err.message.slice(0, 40) : "unknown");
            this.titleElement.style.color = "#ff5555";
            this.playing = false;
            this.playPauseElement.innerHTML = "&#9654;";
        });
        this.playing = true;
        this.playPauseElement.innerHTML = "&#10074;&#10074;";
        this.titleElement.textContent = this.tracks[index].replace(/\.[^.]+$/, "");
        this.titleElement.style.color = "";
        this.renderList();
        this.updateProgress();
    }

    toggle() {
        if (this.current === -1) {
            if (this.tracks.length) this.play(0);
            return;
        }
        if (this.playing) {
            this.audio.pause();
            this.playing = false;
            this.playPauseElement.innerHTML = "&#9654;";
        } else {
            this.audio.play();
            this.playing = true;
            this.playPauseElement.innerHTML = "&#10074;&#10074;";
        }
    }

    next(auto) {
        if (!this.tracks.length) return;
        const nextIndex = (this.current + 1) % this.tracks.length;
        if (auto && this.current === this.tracks.length - 1) {
            // End of list: stop at first track, don't loop unless user asks
            this.play(0);
            this.toggle();
            return;
        }
        this.play(nextIndex);
    }

    previous() {
        if (!this.tracks.length) return;
        this.play((this.current - 1 + this.tracks.length) % this.tracks.length);
    }

    updateProgress() {
        if (!this.audio.duration || isNaN(this.audio.duration)) {
            this.timeElement.textContent = "--:-- / --:--";
            this.barElement.style.width = "0%";
            return;
        }
        const fmt = (s) => {
            s = Math.floor(s);
            return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2);
        };
        this.timeElement.textContent = fmt(this.audio.currentTime) + " / " + fmt(this.audio.duration);
        this.barElement.style.width = (this.audio.currentTime / this.audio.duration * 100) + "%";
    }
}

module.exports = {
    MusicPlayer
};
