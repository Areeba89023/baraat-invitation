import { useEffect, useRef, useState } from "react";
import "./Baraat.css";

function Baraat() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [scratched, setScratched] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);

  const canvasRef = useRef(null);
  const playerRef = useRef(null);

  // ==========================================
  // YOUTUBE MUSIC
  // ==========================================

  useEffect(() => {
    const createPlayer = () => {
      if (!window.YT || !window.YT.Player || playerRef.current) {
        return;
      }

      playerRef.current = new window.YT.Player("youtube-player", {
        height: "1",
        width: "1",
        videoId: "qtz5mpvgAM0",

        playerVars: {
          autoplay: 0,
          controls: 0,
          start: 30,
          rel: 0,
          modestbranding: 1,
        },

        events: {
          onReady: (event) => {
            event.target.seekTo(30, true);
          },

          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setMusicPlaying(true);
            }

            if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              setMusicPlaying(false);
            }
          },
        },
      });
    };

    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        createPlayer();
        return;
      }

      window.onYouTubeIframeAPIReady = createPlayer;

      const existingScript = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      );

      if (!existingScript) {
        const script = document.createElement("script");

        script.src = "https://www.youtube.com/iframe_api";

        document.body.appendChild(script);
      }
    };

    loadYouTubeAPI();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    if (!playerRef.current || !window.YT) {
      return;
    }

    const state = playerRef.current.getPlayerState();

    if (state === window.YT.PlayerState.PLAYING) {
      playerRef.current.pauseVideo();
      setMusicPlaying(false);
    } else {
      playerRef.current.seekTo(30, true);
      playerRef.current.playVideo();
      setMusicPlaying(true);
    }
  };

  // ==========================================
  // COUNTDOWN
  // ==========================================

  useEffect(() => {
    const target = new Date(
      "2026-10-31T22:00:00+05:00"
    );

    const updateCountdown = () => {
      const now = new Date();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });

        return;
      }

      setTimeLeft({
        days: Math.floor(
          difference / (1000 * 60 * 60 * 24)
        ),

        hours: Math.floor(
          (difference / (1000 * 60 * 60)) % 24
        ),

        minutes: Math.floor(
          (difference / (1000 * 60)) % 60
        ),

        seconds: Math.floor(
          (difference / 1000) % 60
        ),
      });
    };

    updateCountdown();

    const interval = setInterval(
      updateCountdown,
      1000
    );

    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // SCRATCH CARD
  // ==========================================

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();

      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      ctx.globalCompositeOperation =
        "source-over";

      // Scratch card base
      ctx.fillStyle = "#b79b78";

      ctx.fillRect(
        0,
        0,
        rect.width,
        rect.height
      );

      // Decorative texture
      ctx.fillStyle = "#d8c3a3";

      for (
        let x = 0;
        x < rect.width;
        x += 18
      ) {
        for (
          let y = 0;
          y < rect.height;
          y += 18
        ) {
          ctx.fillRect(
            x,
            y,
            7,
            7
          );
        }
      }

      // Scratch message
      ctx.fillStyle = "#fffaf3";

      ctx.font =
        "600 15px Montserrat, sans-serif";

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(
        "Gently scratch to reveal",
        rect.width / 2,
        rect.height / 2 - 12
      );

      ctx.font =
        "400 12px Montserrat, sans-serif";

      ctx.fillText(
        "our special day",
        rect.width / 2,
        rect.height / 2 + 12
      );
    };

    resizeCanvas();

    window.addEventListener(
      "resize",
      resizeCanvas
    );

    return () => {
      window.removeEventListener(
        "resize",
        resizeCanvas
      );
    };
  }, []);

  const scratch = (event) => {
    if (scratched) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const rect =
      canvas.getBoundingClientRect();

    const ctx = canvas.getContext("2d");

    let clientX;
    let clientY;

    if (
      event.touches &&
      event.touches.length > 0
    ) {
      clientX =
        event.touches[0].clientX;

      clientY =
        event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    if (
      clientX === undefined ||
      clientY === undefined
    ) {
      return;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation =
      "destination-out";

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      38,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // Reveal after the user has scratched
    // enough of the card.
    setTimeout(() => {
      setScratched(true);
    }, 1500);
  };

  // ==========================================
  // GOOGLE CALENDAR
  // ==========================================

  const addToCalendar = () => {
    const event = {
      title: "Baraat Ceremony",

      location:
        "The Manor Banquet, Shahra-e-Faisal, Darwaish Colony, Karachi",

      start: "20261031T210000",

      end: "20261031T235900",

      timezone: "Asia/Karachi",
    };

    const details = `
Baraat Ceremony

Arrival Of Baraat — 09:00 PM
Dinner — 10:00 PM
Rukhsati — 11:00 PM

No Box Gifts Please.
Your presence, love and blessings are more than enough for us.
`;

    const url =
      `https://www.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(event.title)}` +
      `&dates=${event.start}/${event.end}` +
      `&details=${encodeURIComponent(details)}` +
      `&location=${encodeURIComponent(event.location)}` +
      `&ctz=${encodeURIComponent(event.timezone)}` +
      `&trp=true`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="baraat-page">

      {/* ======================================
          HIDDEN YOUTUBE PLAYER
      ====================================== */}

      <div
        id="youtube-player"
        style={{
          position: "fixed",
          width: "1px",
          height: "1px",
          opacity: 0,
          pointerEvents: "none",
          left: "-10px",
          top: "-10px",
        }}
      />

      {/* ======================================
          MUSIC BUTTON
      ====================================== */}

      <button
        className={`music-button ${
          musicPlaying
            ? "music-playing"
            : ""
        }`}
        onClick={toggleMusic}
        aria-label={
          musicPlaying
            ? "Pause music"
            : "Play music"
        }
      >
        {musicPlaying
          ? "♫ MUSIC ON"
          : "♫ PLAY MUSIC"}
      </button>

      {/* ======================================
          HERO
      ====================================== */}

      <section className="hero">

        <div className="hero-content">

          <div className="bismillah">
            ﷽
          </div>

          <p className="parents">
            <strong>
              Mr & Mrs Advocate Ashraf Ali
            </strong>
          </p>

          <p className="grandparents">
            <strong>
              Granddaughter of Mr & Mrs Sheikh Abdul Latif (Late)
              <br />
              & Mr & Mrs. Wasi Uddin Warsi (Late)
            </strong>
          </p>

          <p className="invite-text">
            Cordially Invite You To The
          </p>

          <h1>
            BARAAT
            <span>CEREMONY</span>
          </h1>

          <p className="daughter-text">
            Of Their Beloved Daughter
          </p>

          {/* ==================================
              BRIDE & GROOM IMAGES
          ================================== */}

          <div className="couple-visuals">

            <div className="person">

              <div className="person-frame">

                <img
                  src="/images/baraat-bride.png"
                  alt="Bride"
                  className="person-image"
                />

              </div>

            </div>

            <div className="couple-ampersand">
              &
            </div>

            <div className="person">

              <div className="person-frame">

                <img
                  src="/images/baraat-groom.png"
                  alt="Groom"
                  className="person-image"
                />

              </div>

            </div>

          </div>

          <div className="ornament">
            ❦
          </div>

        </div>

      </section>

      {/* ======================================
          DATE
      ====================================== */}

      <section className="date-section">

        <div className="ornament-small">
          ✦
        </div>

        <p className="section-label">
          A DATE TO REMEMBER
        </p>

        <h2>
          Scratch to Reveal
        </h2>

        <div
          className={`scratch-card ${
            scratched
              ? "is-scratched"
              : ""
          }`}
        >

          <div className="revealed-date">

            <strong>
              31 OCTOBER 2026
            </strong>

            <span>
              SATURDAY
            </span>

          </div>

          <canvas
            ref={canvasRef}
            onMouseDown={scratch}
            onMouseMove={(event) => {
              if (event.buttons === 1) {
                scratch(event);
              }
            }}
            onTouchStart={scratch}
            onTouchMove={scratch}
          />

          {!scratched && (
            <div className="scratch-overlay">

              <span>
                Gently scratch the card to reveal
                our special day
              </span>

            </div>
          )}

        </div>

        <p className="save-date">
          SAVE THE DATE
        </p>

      </section>

      {/* ======================================
          COUNTDOWN
      ====================================== */}

      <section className="countdown-section">

        <p className="section-label">
          THE BARAAT
        </p>

        <h2>
          Counting The Moments
        </h2>

        <div className="countdown">

          <div className="countdown-item">
            <strong>
              {timeLeft.days}
            </strong>

            <span>
              DAYS
            </span>
          </div>

          <div className="countdown-item">
            <strong>
              {timeLeft.hours}
            </strong>

            <span>
              HOURS
            </span>
          </div>

          <div className="countdown-item">
            <strong>
              {timeLeft.minutes}
            </strong>

            <span>
              MINUTES
            </span>
          </div>

          <div className="countdown-item">
            <strong>
              {timeLeft.seconds}
            </strong>

            <span>
              SECONDS
            </span>
          </div>

        </div>

        <div className="ornament">
          ❧
        </div>

      </section>

      {/* ======================================
          VENUE
      ====================================== */}

      <section className="venue-section">

        <p className="section-label">
          THE VENUE
        </p>

        <h2>
          The Manor Banquet
        </h2>

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
          className="directions"
        >
          ⌖ GET DIRECTIONS →
        </a>

      </section>

      {/* ======================================
          PROGRAMME
      ====================================== */}

      <section className="programme-section">

        <p className="section-label">
          PROGRAMME
        </p>

        <h2>
          Evening Details
        </h2>

        <div className="programme-list">

          <div>
            <span>
              Arrival Of Baraat
            </span>

            <strong>
              09:00 PM
            </strong>
          </div>

          <div>
            <span>
              Dinner
            </span>

            <strong>
              10:00 PM
            </strong>
          </div>

          <div>
            <span>
              Rukhsati
            </span>

            <strong>
              11:00 PM
            </strong>
          </div>

        </div>

        <div className="ornament-small">
          ✦
        </div>

      </section>

      {/* ======================================
          WELCOME
      ====================================== */}

      <section className="welcome-section">

        <p className="section-label">
          AWAITING TO WELCOME
        </p>

        <h2>
          OUR BELOVED FAMILY & FRIENDS
        </h2>

        <p>
          Your presence, prayers and blessings
          <br />
          will make our celebration even more special.
        </p>

        <h3>
          Awaiting to Welcome
        </h3>

        <h2>
          Mr & Mrs Advocate Ashraf Ali
        </h2>

      </section>

      {/* ======================================
          RSVP
      ====================================== */}

      <section className="rsvp-section">

        <p className="section-label">
          RSVP
        </p>

        <p>
          FOR ANY ASSISTANCE
        </p>

        <h3>
          Advocate Ashraf Ali
        </h3>

        <a href="tel:+923342595325">
          03342595325
        </a>

        <div className="ornament">
          ❦
        </div>

      </section>

      {/* ======================================
          CALENDAR + GIFT MESSAGE
      ====================================== */}

      {scratched && (
        <div className="calendar-box">

          <button
            onClick={addToCalendar}
          >
            ADD TO CALENDAR
          </button>

          <div className="gift-message">

            <strong>
              NO BOX GIFTS PLEASE
            </strong>

            <p>
              Your presence, love and blessings
              are more than enough for us.
            </p>

          </div>

        </div>
      )}

      {/* ======================================
          FOOTER
      ====================================== */}

      <section className="footer-section">

        <p>
          WITH LOVE & BLESSINGS
        </p>

      </section>

    </div>
  );
}

export default Baraat;
