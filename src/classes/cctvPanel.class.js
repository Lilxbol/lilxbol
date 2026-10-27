class CctvPanel {
    constructor(parentId) {
        if (!parentId) throw "Missing parameters";

        const ipc = require("electron").ipcRenderer;

        // Create DOM
        this.parent = document.getElementById(parentId);
        this.parent.innerHTML += `<div id="mod_cctv">
            <h1>CCTV<i id="mod_cctv_status"><span id="mod_cctv_rec"></span> LIVE</i></h1>
            <div id="mod_cctv_screen">
                <img id="mod_cctv_img" alt="" />
                <div id="mod_cctv_target">
                    <div id="mod_cctv_reticle"></div>
                    <div id="mod_cctv_label">TRK-01</div>
                </div>
                <div id="mod_cctv_scanlines"></div>
            </div>
            <div id="mod_cctv_footer">
                <span id="mod_cctv_coords">X:-- Y:--</span>
                <span id="mod_cctv_ts">--:--:--</span>
            </div>
        </div>`;

        this.img = document.getElementById("mod_cctv_img");
        this.target = document.getElementById("mod_cctv_target");
        this.coords = document.getElementById("mod_cctv_coords");
        this.ts = document.getElementById("mod_cctv_ts");
        this.status = document.getElementById("mod_cctv_status");
        this.gotFrame = false;

        ipc.on("cctv-frame", (e, frame) => {
            if (!frame) {
                this.status.innerHTML = " NO SIGNAL";
                return;
            }
            this.gotFrame = true;
            this.status.innerHTML = `<span id="mod_cctv_rec"></span> LIVE`;
            this.img.src = frame.image;
            const w = this.img.clientWidth || 100;
            const h = this.img.clientHeight || 60;
            this.target.style.left = (frame.x * 100) + "%";
            this.target.style.top = (frame.y * 100) + "%";
            this.coords.textContent = "X:" + Math.round(frame.x * 1000) / 10 + "% Y:" + Math.round(frame.y * 1000) / 10 + "%";
            const now = new Date();
            this.ts.textContent = ("0"+now.getHours()).slice(-2) + ":" + ("0"+now.getMinutes()).slice(-2) + ":" + ("0"+now.getSeconds()).slice(-2);
        });

        this.requestFrame = () => { ipc.send("cctv-request"); };
        this.requestFrame();
        this.updater = setInterval(this.requestFrame, 900);
    }
}

module.exports = {
    CctvPanel
};
