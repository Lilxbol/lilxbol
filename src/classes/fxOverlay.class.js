class FxOverlay {
    constructor() {
        // CRT overlay
        let crt = document.createElement("div");
        crt.id = "fx_crt";
        document.body.appendChild(crt);

        // Telegram tag
        let tg = document.createElement("div");
        tg.id = "fx_tg";
        tg.innerHTML = `TG <em>@abolfazlzofficial</em>`;
        document.body.appendChild(tg);

        // Digital rain
        this.canvas = document.createElement("canvas");
        this.canvas.id = "fx_rain";
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");

        this.glyphs = "01ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﬀABCDEF#$%&*+-<>|/\\=?:;";
        this.resize();
        window.addEventListener("resize", () => this.resize());

        this.columns = [];
        this.initColumns();

        setInterval(() => this.draw(), 90);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initColumns() {
        const count = Math.floor(this.canvas.width / 16);
        this.columns = [];
        for (let i = 0; i < count; i++) {
            this.columns[i] = Math.floor(Math.random() * this.canvas.height / 18);
        }
    }

    draw() {
        const ctx = this.ctx;
        if (!ctx || !this.columns.length) this.initColumns();
        ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.font = "13px monospace";

        const r = (window.theme && window.theme.r) || 189;
        const g = (window.theme && window.theme.g) || 147;
        const b = (window.theme && window.theme.b) || 249;

        for (let i = 0; i < this.columns.length; i++) {
            const char = this.glyphs[Math.floor(Math.random() * this.glyphs.length)];
            const x = i * 16;
            const y = this.columns[i] * 18;
            // Leading glyph slightly brighter
            ctx.fillStyle = `rgba(255,255,255,0.6)`;
            ctx.fillText(char, x, y);
            ctx.fillStyle = `rgba(${r},${g},${b},0.8)`;
            ctx.fillText(this.glyphs[Math.floor(Math.random() * this.glyphs.length)], x, y - 18);

            if (y > this.canvas.height && Math.random() > 0.975) {
                this.columns[i] = 0;
            } else {
                this.columns[i]++;
            }
        }
    }
}

module.exports = {
    FxOverlay
};
