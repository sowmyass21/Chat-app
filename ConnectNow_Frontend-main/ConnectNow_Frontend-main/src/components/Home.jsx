import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Home = () => {
  const user = useSelector((s) => s.user);

  return (
    <div className="relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[28rem] h-[28rem] rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute bottom-[-15rem] left-1/2 -translate-x-1/2 w-[50rem] h-[50rem] rounded-full bg-blue-100/30 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">
              Welcome{user?.firstName ? `, ${user.firstName}` : ""}
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900">
              Build meaningful professional connections
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-xl">
              ConnectNow helps you discover talented people, grow your network,
              and collaborate with ease. Explore profiles, send requests, and
              chat in real time.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/feed"
                className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-blue-700 shadow-sm"
              >
                Discover Profiles
              </Link>
              <Link
                to="/profile"
                className="px-6 py-3 rounded-xl bg-white/70 backdrop-blur-md border border-slate-200 text-slate-800 font-semibold hover:bg-white shadow-sm"
              >
                Complete Your Profile
              </Link>
            </div>
            {/* Mini stats */}
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[
                { label: "Professionals", value: "10k+" },
                { label: "Skills", value: "250+" },
                { label: "Live chats", value: "Realtime" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="text-center bg-white/70 backdrop-blur-md border border-slate-200 rounded-xl p-4"
                >
                  <div className="text-2xl font-extrabold text-slate-900">
                    {s.value}
                  </div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Simple illustration */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="aspect-[5/4] rounded-3xl bg-white/70 backdrop-blur-md border border-slate-200 shadow-xl flex items-center justify-center overflow-hidden">
              <svg
                viewBox="0 0 400 320"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0" stopColor="#60a5fa" stopOpacity="0.6" />
                    <stop offset="1" stopColor="#34d399" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width="400"
                  height="320"
                  fill="url(#g1)"
                  opacity="0.08"
                />
                {[
                  { cx: 80, cy: 80 },
                  { cx: 320, cy: 70 },
                  { cx: 200, cy: 160 },
                  { cx: 120, cy: 240 },
                  { cx: 300, cy: 230 },
                ].map((n, i) => (
                  <g key={i}>
                    <circle
                      cx={n.cx}
                      cy={n.cy}
                      r="28"
                      fill="#ffffff"
                      stroke="#e5e7eb"
                    />
                    <circle
                      cx={n.cx}
                      cy={n.cy}
                      r="10"
                      fill="#93c5fd"
                      className="animate-pulse"
                      style={{ animationDelay: `${i * 0.25}s` }}
                    />
                  </g>
                ))}
                <g stroke="#cbd5e1" strokeWidth="2">
                  <line x1="80" y1="80" x2="200" y2="160" />
                  <line x1="320" y1="70" x2="200" y2="160" />
                  <line x1="120" y1="240" x2="200" y2="160" />
                  <line x1="300" y1="230" x2="200" y2="160" />
                </g>
              </svg>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full shadow">
              Secure & Private
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: 1,
              title: "Create your profile",
              text: "Share your skills, experience, and what you’re looking for.",
            },
            {
              step: 2,
              title: "Discover & connect",
              text: "Use filters to find relevant people and send requests.",
            },
            {
              step: 3,
              title: "Chat & collaborate",
              text: "Message connections instantly and keep work moving.",
            },
          ].map((it) => (
            <div
              key={it.step}
              className="relative bg-white/70 backdrop-blur-md border border-slate-200 rounded-2xl p-6"
            >
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-extrabold shadow">
                {it.step}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {it.title}
              </h3>
              <p className="text-sm text-slate-600 mt-2">{it.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Discover",
              desc: "Find relevant professionals with tidy filters.",
              icon: (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              ),
              to: "/feed",
            },
            {
              title: "Network",
              desc: "Send requests and grow your circle.",
              icon: (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ),
              to: "/connections",
            },
            {
              title: "Chat",
              desc: "Message connections instantly and stay in sync.",
              icon: (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ),
              to: "/connections",
            },
          ].map((f) => (
            <Link
              key={f.title}
              to={f.to}
              className="group bg-white/70 backdrop-blur-md border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 text-slate-800">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/20">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
              </div>
              <p className="mt-3 text-sm text-slate-600">{f.desc}</p>
              <div className="mt-4 text-sm font-semibold text-primary group-hover:underline">
                Go
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
