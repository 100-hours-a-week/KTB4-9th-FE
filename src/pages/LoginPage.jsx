import { useNavigate } from "react-router";
import { useEffect, useRef } from "react";
import CosmosLogo from "../components/common/CosmosLogo.jsx";
import { getStoredUser, storeUser } from "../services/auth.js";
export default function LoginPage() {
	const navigate = useNavigate();
	const canvasRef = useRef(null);
	useEffect(() => {
		if (getStoredUser()) {
			navigate("/", { replace: true });
		}
	}, [navigate]);
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const COLORS = [
			[
				255,
				255,
				255
			],
			[
				200,
				220,
				255
			],
			[
				180,
				160,
				255
			],
			[
				255,
				240,
				210
			],
			[
				168,
				85,
				247
			]
		];
		const makeStars = () => Array.from({ length: 180 }, () => {
			const color = COLORS[Math.floor(Math.random() * COLORS.length)];
			const r = Math.random() * 1.6 + .2;
			return {
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				r,
				speed: Math.random() * .4 + .06,
				phase: Math.random() * Math.PI * 2,
				color,
				sparkle: r > 1.2 && Math.random() > .55
			};
		});
		let stars = [];
		const resize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			stars = makeStars();
		};
		resize();
		window.addEventListener("resize", resize);
		const shoots = [];
		let nextShoot = 2 + Math.random() * 3;
		function spawnShoot() {
			const angle = (Math.random() * 30 + 15) * (Math.PI / 180);
			const speed = 6 + Math.random() * 5;
			shoots.push({
				x: Math.random() * (canvas?.width ?? 400) * .8,
				y: Math.random() * (canvas?.height ?? 800) * .4,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				len: 60 + Math.random() * 60,
				life: 0,
				maxLife: 40 + Math.random() * 20
			});
		}
		function drawSparkle(x, y, r, a, [cr, cg, cb]) {
			const arm = r * 3.5;
			ctx.save();
			ctx.globalAlpha = a;
			ctx.strokeStyle = `rgb(${cr},${cg},${cb})`;
			ctx.lineWidth = r * .55;
			ctx.lineCap = "round";
			for (let i = 0; i < 4; i++) {
				const angle = i * Math.PI / 2;
				ctx.beginPath();
				ctx.moveTo(x + Math.cos(angle) * r * .5, y + Math.sin(angle) * r * .5);
				ctx.lineTo(x + Math.cos(angle) * arm, y + Math.sin(angle) * arm);
				ctx.stroke();
			}
			ctx.restore();
		}
		let raf;
		let t = 0;
		let elapsed = 0;
		function draw() {
			const W = canvas.width, H = canvas.height;
			ctx.clearRect(0, 0, W, H);
			t += .016;
			elapsed += .016;
			if (elapsed > nextShoot) {
				spawnShoot();
				nextShoot = elapsed + 2.5 + Math.random() * 4;
			}
			for (let i = shoots.length - 1; i >= 0; i--) {
				const s = shoots[i];
				s.life++;
				const progress = s.life / s.maxLife;
				const alpha = progress < .3 ? progress / .3 : 1 - (progress - .3) / .7;
				const tx = s.x + s.vx * s.life;
				const ty = s.y + s.vy * s.life;
				const grd = ctx.createLinearGradient(tx - s.vx * s.len / 8, ty - s.vy * s.len / 8, tx, ty);
				grd.addColorStop(0, `rgba(255,255,255,0)`);
				grd.addColorStop(1, `rgba(220,200,255,${alpha * .9})`);
				ctx.beginPath();
				ctx.moveTo(tx - s.vx * s.len / 8, ty - s.vy * s.len / 8);
				ctx.lineTo(tx, ty);
				ctx.strokeStyle = grd;
				ctx.lineWidth = 1.5;
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(tx, ty, 1.5, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(255,255,255,${alpha})`;
				ctx.fill();
				if (s.life >= s.maxLife) shoots.splice(i, 1);
			}
			for (const s of stars) {
				const a = .25 + .75 * Math.abs(Math.sin(t * s.speed + s.phase));
				const [cr, cg, cb] = s.color;
				if (s.sparkle) {
					ctx.beginPath();
					ctx.arc(s.x, s.y, s.r * 1.8, 0, Math.PI * 2);
					ctx.fillStyle = `rgba(${cr},${cg},${cb},${a * .15})`;
					ctx.fill();
					ctx.beginPath();
					ctx.arc(s.x, s.y, s.r * .6, 0, Math.PI * 2);
					ctx.fillStyle = `rgba(${cr},${cg},${cb},${a})`;
					ctx.fill();
					drawSparkle(s.x, s.y, s.r, a * .9, s.color);
				} else {
					ctx.beginPath();
					ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
					ctx.fillStyle = `rgba(${cr},${cg},${cb},${a * .85})`;
					ctx.fill();
				}
			}
			raf = requestAnimationFrame(draw);
		}
		draw();
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", resize);
		};
	}, []);
	function handleKakao() {
		storeUser({
			name: "개발자",
			email: "dev@cosmos.ai"
		});
		navigate("/", { replace: true });
	}
	return <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-[#05050F]">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 55% at 50% 40%, rgba(124,58,237,0.18) 0%, transparent 70%)" }} />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-8">
        <div className="mb-8 relative">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{
		background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
		boxShadow: "0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(124,58,237,0.2)"
	}}>
	    <CosmosLogo />
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-wider mb-2" style={{
		fontFamily: "'JetBrains Mono', monospace",
		color: "#E2E0F0"
	}}>
          COSMOS
        </h1>
        <p className="text-sm text-[#6B6890] mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          나만의 알고리즘 튜터
        </p>
        <p className="text-xs text-[#4A4870] mb-12 text-center leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
          AI가 실력에 맞는 코딩 테스트 문제를<br />무제한으로 생성해 드립니다
        </p>

        <button onClick={handleKakao} className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl active:scale-95 transition-all duration-150" style={{
		background: "#FEE500",
		boxShadow: "0 4px 20px rgba(254,229,0,0.25)"
	}}>
          <KakaoIcon />
          <span className="text-[15px] font-semibold text-[#191919]" style={{ fontFamily: "'Outfit', sans-serif" }}>
            카카오로 계속하기
          </span>
        </button>

        <p className="mt-6 text-xs text-[#3A3860]" style={{ fontFamily: "'Outfit', sans-serif" }}>
          계속하면 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다
        </p>
      </div>

      <div className="absolute bottom-10 flex gap-2 items-center opacity-30">
        {[...Array(3)].map((_, i) => <div key={i} className="rounded-full bg-[#7C3AED]" style={{
		width: i === 1 ? 20 : 6,
		height: 6
	}} />)}
      </div>
    </div>;
}
function KakaoIcon() {
	return <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <ellipse cx="11" cy="10" rx="9" ry="8" fill="#191919" />
      <path d="M11 4C7.134 4 4 6.462 4 9.5c0 1.924 1.21 3.617 3.04 4.636L6.3 17l3.42-2.263C10.13 14.907 10.56 14.95 11 14.95c3.866 0 7-2.462 7-5.45S14.866 4 11 4z" fill="#FEE500" />
    </svg>;
}
