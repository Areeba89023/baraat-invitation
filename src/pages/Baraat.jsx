import { useEffect, useRef, useState } from "react";
import "./Baraat.css";

const EVENT_DATE = new Date("2026-10-31T22:00:00+05:00").getTime();
const MUSIC_VIDEO_ID = "qtz5mpvgAM0";

function Baraat() {
  const [invitationOpen, setInvitationOpen] = useState(false);
  const [scratched, setScratched] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);

  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  const canvasRef = useRef(null);
  const playerRef = useRef(null);
  const scratchingRef = useRef(false);
  const musicStartedRef = useRef(false);
  const scratchCanvasReadyRef = useRef(false);

  /* ---------------- OPEN INVITATION + MUSIC ---------------- */

  const openInvitation = () => {
    setInvitationOpen(true);

    if (playerRef.current) {
      try {
        playerRef.current.seekTo(30, true);
        playerRef.current.playVideo();
        musicStartedRef.current = true;
        setMusicPlaying(true);
      } catch (error) {
        console.log("Music could not start:", error);
      }
    }
  };

  /* ---------------- YOUTUBE MUSIC ---------------- */

  useEffect(() => {
    const createPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      playerRef.current = new window.YT.Player("youtube-player", {
        height: "1",
        width: "1",
        videoId: MUSIC_VIDEO_ID,
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          playsinline: 1,
          start: 30,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => {
            event.target.seekTo(30, true);
            event.target.setVolume(80);
          },
          onStateChange: (event) => {
            if (
              window.YT &&
              event.data === window.YT.PlayerState.PLAYING
            ) {
              setMusicPlaying(true);
            }

            if (
              window.YT &&
              event.data === window.YT.PlayerState.PAUSED
            ) {
              setMusicPlaying(false);
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;

      if (!document.getElementById("youtube-api")) {
        const script = document.createElement("script");
        script.id = "youtube-api";
        script.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(script);
      }
    }

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  const toggleMusic = (event) => {
    event.stopPropagation();

    if (!playerRef.current) return;

    try {
      if (musicPlaying) {
        playerRef.current.pauseVideo();
        setMusicPlaying(false);
      } else {
        if (!musicStartedRef.current) {
          playerRef.current.seekTo(30, true);
          musicStartedRef.current = true;
        }

        playerRef.current.playVideo();
        setMusicPlaying(true);
      }
    } catch (error) {
      console.log("Music control error:", error);
    }
  };

  /* ---------------- COUNTDOWN ---------------- */

  useEffect(() => {
    const updateCountdown = () => {
      const difference = EVENT_DATE - Date.now();

      if (difference <= 0) {
        setTimeLeft({
          days: "00",
          hours: "00",
          minutes: "00",
          seconds: "00",
        });
        return;
      }

      const days = Math.floor(
        difference / (1000 * 60 * 60 * 24)
      );

      const hours = Math.floor(
        (difference / (1000 * 60 * 60)) % 24
      );

      const minutes = Math.floor(
        (difference / (1000 * 60)) % 60
      );

      const seconds = Math.floor(
        (difference / 1000) % 60
      );

      setTimeLeft({
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  /* ---------------- SCRATCH CARD ---------------- */

  useEffect(() => {
    if (!invitationOpen || scratched) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;

    const setupCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.globalCompositeOperation = "source-over";

      ctx.fillStyle = "#7d252b";
      ctx.fillRect(0, 0, rect.width, rect.height);

      ctx.fillStyle = "#d8bd7a";
      ctx.font = "600 15px Montserrat, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "SCRATCH TO REVEAL",
        rect.width / 2,
        rect.height / 2
      );

      ctx.globalCompositeOperation = "destination-out";

      scratchCanvasReadyRef.current = true;
    };

    setupCanvas();

    const handleResize = () => {
      if (!scratchingRef.current) {
        setupCanvas();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [invitationOpen, scratched]);

  const scratchAt = (clientX, clientY) => {
    const canvas = canvasRef.current;

    if (!canvas || scratched || !scratchCanvasReadyRef.current) {
      return;
    }

    const rect = canvas.getBoundingClientRect();

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext("2d");

    ctx.save();

    ctx.globalCompositeOperation = "destination-out";

    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    checkScratchProgress();
  };

  const checkScratchProgress = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const sampleWidth = 80;
    const sampleHeight = 40;

    const scaleX = canvas.width / sampleWidth;
    const scaleY = canvas.height / sampleHeight;

    let transparent = 0;
    let total = 0;

    for (let y = 0; y < sampleHeight; y++) {
      for (let x = 0; x < sampleWidth; x++) {
        const realX = Math.floor(x * scaleX);
        const realY = Math.floor(y * scaleY);

        const pixel = ctx.getImageData(
          realX,
          realY,
          1,
          1
        ).data;

        total++;

        if (pixel[3] < 80) {
          transparent++;
        }
      }
    }

    const percentage = (transparent / total) * 100;

    if (percentage >= 45) {
      setScratched(true);
      scratchingRef.current = false;
    }
  };

  const handlePointerDown = (event) => {
    event.preventDefault();

    scratchingRef.current = true;

    scratchAt(event.clientX, event.clientY);
  };

  const handlePointerMove = (event) => {
    if (!scratchingRef.current) return;

    event.preventDefault();

    scratchAt(event.clientX, event.clientY);
  };

  const handlePointerUp = () => {
    scratchingRef.current = false;
  };

  /* ---------------- CALENDAR ---------------- */

  const addToCalendar = () => {
    const title = "Baraat Ceremony";

    const details = [
      "Arrival Of Baraat — 09:00 PM",
      "Dinner — 10:00 PM",
      "Rukhsati — 11:00 PM",
      "",
      "Your presence, love and blessings are more than enough for us.",
      "",
      "No Box Gifts Please.",
    ].join("\n");

    const location =
      "The Manor Banquet, Shahra-e-Faisal, Darwaish Colony, Karachi";

    const start = "20261031T210000";
    const end = "20261031T235900";

    const calendarUrl =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(title)}` +
      `&dates=${start}/${end}` +
      `&details=${encodeURIComponent(details)}` +
      `&location=${encodeURIComponent(location)}` +
      "&ctz=Asia/Karachi";

    window.open(calendarUrl, "_blank");
  };

  /* ---------------- OPENING COVER ---------------- */

  if (!invitationOpen) {
    return (
      <main className="opening-screen">
        <div id="youtube-player" className="youtube-player" />

        <div className="opening-decoration top-decoration">
          ❦
        </div>

        <div className="opening-content">
          <p className="opening-small">
            THE WEDDING CELEBRATION
          </p>

          <div className="opening-symbol">❦</div>

          <h1 className="opening-title">BARAAT</h1>

          <p className="opening-subtitle">
            A Celebration of Love
          </p>

          <button
            className="tap-open-button"
            onClick={openInvitation}
          >
            TAP TO OPEN
          </button>
        </div>

        <div className="opening-decoration bottom-decoration">
          ❦
        </div>
      </main>
    );
  }

  /* ---------------- INVITATION ---------------- */

  return (
    <main className="baraat-page invitation-open">
      <div id="youtube-player" className="youtube-player" />

      <button
        className={`music-button ${
          musicPlaying ? "playing" : ""
        }`}
        onClick={toggleMusic}
        aria-label={
          musicPlaying ? "Pause music" : "Play music"
        }
      >
        {musicPlaying ? "❚❚" : "♫"}
      </button>

      {/* CURTAINS */}

      <div className="opening-curtain curtain-opened">
        <div className="curtain-panel curtain-left" />
        <div className="curtain-panel curtain-right" />

        <div className="curtain-centre-text">
          <div className="curtain-small">
            WITH LOVE & BLESSINGS
          </div>

          <div className="curtain-title">BARAAT</div>

          <div className="curtain-line" />
        </div>
      </div>

      {/* HERO */}

      <section className="hero-section">
        <div className="hero-border">
          <div className="hero-inner">
            <div className="family-name">
              Mr & Mrs Advocate Ashraf Ali
            </div>

            <p className="family-line">
              Granddaughter of Mr & Mrs Sheikh Abdul Latif
              (Late)
              <br />
              & Mr & Mrs. Wasi Uddin Warsi (Late)
            </p>

            <div className="invite-line">
              Cordially Invite You To The
            </div>

            <h1 className="baraat-title">
              BARAAT CEREMONY
            </h1>

            <div className="title-divider">
              <span />
              <span className="diamond">◆</span>
              <span />
            </div>

            <div className="beloved-line">
              Of Their Beloved Daughter
            </div>

            {/* PLAIN PHOTOS — NO BOXES */}

            <div className="couple-visuals">
              <div className="person">
                <img
                  src="/images/baraat-bride.png"
                  alt="Bride"
                  className="person-image"
                />
              </div>

              <div className="couple-ampersand">
                &
              </div>

              <div className="person">
                <img
                  src="/images/baraat-groom.png"
                  alt="Groom"
                  className="person-image"
                />
              </div>
            </div>

            {/* SCRATCH DATE */}

            <div className="date-reveal-area">
              {!scratched ? (
                <div className="scratch-wrapper">
                  <div className="hidden-date">
                    <div className="date-day">
                      31 OCTOBER 2026
                    </div>

                    <div className="date-weekday">
                      SATURDAY
                    </div>
                  </div>

                  <canvas
                    ref={canvasRef}
                    className="scratch-canvas"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                  />
                </div>
              ) : (
                <div className="revealed-date">
                  <div className="revealed-date-main">
                    31 OCTOBER 2026
                  </div>

                  <div className="revealed-date-day">
                    SATURDAY
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* COUNTDOWN — SEPARATE FROM SCRATCH */}

      <section className="countdown-section">
        <div className="section-heading">
          <span />
          <h2>COUNTDOWN</h2>
          <span />
        </div>

        <div className="countdown-grid">
          <div className="countdown-item">
            <strong>{timeLeft.days}</strong>
            <span>DAYS</span>
          </div>

          <div className="countdown-item">
            <strong>{timeLeft.hours}</strong>
            <span>HOURS</span>
          </div>

          <div className="countdown-item">
            <strong>{timeLeft.minutes}</strong>
            <span>MINUTES</span>
          </div>

          <div className="countdown-item">
            <strong>{timeLeft.seconds}</strong>
            <span>SECONDS</span>
          </div>
        </div>

        <div className="after-countdown">
          <button
            className="calendar-button"
            onClick={addToCalendar}
          >
            ADD TO CALENDAR
          </button>

          <div className="gift-message">
            <div className="gift-title">
              NO BOX GIFTS PLEASE
            </div>

            <p>
              Your presence, love and blessings are more
              than enough for us.
            </p>
          </div>
        </div>
      </section>

      {/* VENUE */}

      <section className="venue-section">
        <div className="section-heading light">
          <span />
          <h2>THE VENUE</h2>
          <span />
        </div>

        <div className="venue-content">
          <h3>The Manor Banquet</h3>

          <p>
            Shahra-e-Faisal
            <br />
            Darwaish Colony
            <br />
            Karachi
          </p>

          <a
            href="https://maps.app.goo.gl/9kn7oBToppmW7R9f6"
            target="_blank"
            rel="noreferrer"
            className="directions-button"
          >
            GET DIRECTIONS
          </a>
        </div>
      </section>

      {/* PROGRAMME */}

      <section className="programme-section">
        <div className="section-heading">
          <span />
          <h2>PROGRAMME</h2>
          <span />
        </div>

        <div className="programme-list">
          <div className="programme-row">
            <span>Arrival Of Baraat</span>
            <strong>09:00 PM</strong>
          </div>

          <div className="programme-row">
            <span>Dinner</span>
            <strong>10:00 PM</strong>
          </div>

          <div className="programme-row">
            <span>Rukhsati</span>
            <strong>11:00 PM</strong>
          </div>
        </div>
      </section>

      {/* WELCOME */}

      <section className="welcome-section">
        <div className="section-heading">
          <span />
          <h2>WELCOME</h2>
          <span />
        </div>

        <p>
          Mr & Mrs Advocate Ashraf Ali
          <br />
          request the pleasure of your company
          <br />
          on this joyous occasion.
        </p>
      </section>

      {/* RSVP */}

      <section className="rsvp-section">
        <div className="section-heading">
          <span />
          <h2>RSVP</h2>
          <span />
        </div>

        <p className="rsvp-name">
          Advocate Ashraf Ali
        </p>

        <a
          href="tel:+923342595325"
          className="rsvp-phone"
        >
          03342595325
        </a>
      </section>

      {/* FOOTER */}

      <footer className="footer-section">
        <div className="footer-line" />

        <p>WITH LOVE & BLESSINGS</p>

        <div className="footer-line" />
      </footer>
    </main>
  );
}

export default Baraat;
