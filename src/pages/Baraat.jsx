import { useEffect, useRef, useState } from "react";
import "./Baraat.css";

const EVENT_DATE = new Date("2026-10-31T22:00:00+05:00").getTime();

const MUSIC_VIDEO_ID = "8mYeTuzBQr4";
const MUSIC_START = 15;

function Baraat() {
  const [invitationOpen, setInvitationOpen] = useState(false);
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [scratched, setScratched] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);

  const canvasRef = useRef(null);
  const playerRef = useRef(null);
  const scratchingRef = useRef(false);
  const musicStartedRef = useRef(false);
  const pendingMusicRef = useRef(false);
  const playerReadyRef = useRef(false);

  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

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

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
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

    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  /* ---------------- YOUTUBE MUSIC ---------------- */

  useEffect(() => {
    const createPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player("baraat-youtube-player", {
        width: "1",
        height: "1",
        videoId: MUSIC_VIDEO_ID,

        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          start: MUSIC_START,
          enablejsapi: 1,
          origin: window.location.origin,
        },

        events: {
          onReady: (event) => {
            playerReadyRef.current = true;

            try {
              event.target.setVolume(85);
              event.target.seekTo(MUSIC_START, true);
            } catch (error) {
              console.log("YouTube setup:", error);
            }

            if (pendingMusicRef.current) {
              try {
                event.target.seekTo(MUSIC_START, true);
                event.target.playVideo();
                musicStartedRef.current = true;
                setMusicPlaying(true);
                pendingMusicRef.current = false;
              } catch (error) {
                console.log("YouTube playback:", error);
              }
            }
          },

          onStateChange: (event) => {
            if (!window.YT) return;

            if (event.data === window.YT.PlayerState.PLAYING) {
              setMusicPlaying(true);
            }

            if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              setMusicPlaying(false);
            }

            if (event.data === window.YT.PlayerState.ENDED) {
              try {
                event.target.seekTo(MUSIC_START, true);
                event.target.playVideo();
              } catch (error) {
                console.log("YouTube restart:", error);
              }
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

      if (document.getElementById("youtube-iframe-api")) {
        return;
      }

      const script = document.createElement("script");
      script.id = "youtube-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;

      document.body.appendChild(script);

      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };
    };

    loadYouTubeAPI();

    const fallbackTimer = setInterval(() => {
      if (window.YT && window.YT.Player && !playerRef.current) {
        createPlayer();
      }
    }, 500);

    return () => {
      clearInterval(fallbackTimer);
    };
  }, []);

  /* ---------------- OPEN INVITATION ---------------- */

  const openInvitation = () => {
    if (invitationOpen) return;

    setInvitationOpen(true);

    /*
      The music is deliberately started from this click.
      This is important because browsers generally block
      audio autoplay unless the user has interacted with the page.
    */

    pendingMusicRef.current = true;

    if (playerRef.current && playerReadyRef.current) {
      try {
        playerRef.current.seekTo(MUSIC_START, true);
        playerRef.current.playVideo();

        musicStartedRef.current = true;
        pendingMusicRef.current = false;
        setMusicPlaying(true);
      } catch (error) {
        console.log("Music start:", error);
      }
    }

    setTimeout(() => {
      setCurtainsOpen(true);
    }, 250);
  };

  /* ---------------- MUSIC BUTTON ---------------- */

  const toggleMusic = () => {
    if (!playerRef.current || !playerReadyRef.current) {
      pendingMusicRef.current = true;
      return;
    }

    try {
      const state = playerRef.current.getPlayerState();

      if (
        state === window.YT.PlayerState.PLAYING
      ) {
        playerRef.current.pauseVideo();
        setMusicPlaying(false);
      } else {
        if (!musicStartedRef.current) {
          playerRef.current.seekTo(MUSIC_START, true);
          musicStartedRef.current = true;
        }

        playerRef.current.playVideo();
        setMusicPlaying(true);
      }
    } catch (error) {
      console.log("Music toggle:", error);
    }
  };

  /* ---------------- SCRATCH CARD ---------------- */

  useEffect(() => {
    if (!invitationOpen) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!ctx) return;

    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect();

      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));

      const dpr = Math.min(window.devicePixelRatio || 1, 3);

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      /*
        Scratch surface
      */

      const gradient = ctx.createLinearGradient(
        0,
        0,
        width,
        height
      );

      gradient.addColorStop(0, "#3b0911");
      gradient.addColorStop(0.5, "#701522");
      gradient.addColorStop(1, "#3b0911");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      /*
        Subtle gold border inside the scratch card.
      */

      ctx.strokeStyle = "#d2af61";
      ctx.lineWidth = 1.5;

      ctx.strokeRect(
        10,
        10,
        width - 20,
        height - 20
      );

      /*
        Scratch instructions
      */

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = "#fffaf0";
      ctx.font = "600 13px Montserrat, sans-serif";
      ctx.letterSpacing = "2px";

      ctx.fillText(
        "SCRATCH TO REVEAL",
        width / 2,
        height / 2 - 10
      );

      ctx.fillStyle = "#ead18b";
      ctx.font = "400 11px Montserrat, sans-serif";

      ctx.fillText(
        "Gently scratch the card",
        width / 2,
        height / 2 + 18
      );
    };

    setupCanvas();

    const handleResize = () => {
      if (!scratched) {
        setupCanvas();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [invitationOpen, scratched]);

  const scratchAt = (clientX, clientY) => {
    if (scratched) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    /*
      Erase the scratch layer.
    */

    ctx.save();

    ctx.globalCompositeOperation = "destination-out";

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      30,
      0,
      Math.PI * 2
    );

    ctx.fill();

    /*
      Slightly wider soft scratch effect.
    */

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      15,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();

    /*
      Check how much of the card has been scratched.
    */

    const width = canvas.width;
    const height = canvas.height;

    const sample = ctx.getImageData(
      0,
      0,
      width,
      height
    ).data;

    let transparentPixels = 0;
    let totalPixels = 0;

    const step = 12;

    for (let yPos = 0; yPos < height; yPos += step) {
      for (let xPos = 0; xPos < width; xPos += step) {
        const index =
          (yPos * width + xPos) * 4;

        const alpha = sample[index + 3];

        totalPixels++;

        if (alpha < 80) {
          transparentPixels++;
        }
      }
    }

    const scratchedPercentage =
      transparentPixels / totalPixels;

    if (scratchedPercentage >= 0.45) {
      setScratched(true);

      /*
        Clear the canvas completely once enough
        of the card has been scratched.
      */

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    }
  };

  const handlePointerDown = (event) => {
    if (scratched) return;

    scratchingRef.current = true;

    try {
      event.currentTarget.setPointerCapture(
        event.pointerId
      );
    } catch (error) {
      // Pointer capture is not supported everywhere.
    }

    scratchAt(
      event.clientX,
      event.clientY
    );
  };

  const handlePointerMove = (event) => {
    if (!scratchingRef.current) return;
    if (scratched) return;

    scratchAt(
      event.clientX,
      event.clientY
    );
  };

  const stopScratching = () => {
    scratchingRef.current = false;
  };

  /* ---------------- CALENDAR ---------------- */

  const addToCalendar = () => {
    const title = "Baraat Ceremony";

    const location =
      "The Manor Banquet, Shahra-e-Faisal, Darwaish Colony, Karachi";

    const start = "20261031T210000";
    const end = "20261031T235900";

    const calendarUrl =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" +
      encodeURIComponent(title) +
      "&dates=" +
      start +
      "/" +
      end +
      "&details=" +
      encodeURIComponent(
        "Baraat Ceremony"
      ) +
      "&location=" +
      encodeURIComponent(location) +
      "&ctz=Asia%2FKarachi";

    window.open(
      calendarUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="baraat-page">

      {/* Hidden YouTube player */}
      <div
        className="youtube-player-container"
        aria-hidden="true"
      >
        <div id="baraat-youtube-player" />
      </div>

      {/* ================= OPENING ================= */}

      <section
        className={`opening-screen ${
          invitationOpen ? "opening-screen-active" : ""
        } ${
          curtainsOpen ? "opening-screen-open" : ""
        }`}
      >

        <div className="opening-content">

          <div className="opening-small">
            THE WEDDING CELEBRATION
          </div>

          <div className="opening-ornament">
            ❦
          </div>

          <h1>BARAAT</h1>

          <p>A Celebration of Love</p>

          {!invitationOpen && (
            <button
              className="open-invitation-button"
              onClick={openInvitation}
              type="button"
            >
              TAP TO OPEN
            </button>
          )}

        </div>

        <div className="curtain-container">

          <div className="curtain curtain-left">
            <div className="curtain-folds" />
            <div className="curtain-edge" />
          </div>

          <div className="curtain curtain-right">
            <div className="curtain-folds" />
            <div className="curtain-edge" />
          </div>

        </div>

      </section>

      {/* ================= INVITATION ================= */}

      <main
        className={`invitation ${
          invitationOpen
            ? "invitation-visible"
            : ""
        }`}
      >

        {/* ================= HERO ================= */}

        <section className="hero-section">

          <div className="quran-arabic">
            ﷽
          </div>

          <div className="quran-verse">
            وَخَلَقْنَاكُمْ أَزْوَاجًا
          </div>

          <div className="quran-translation">
            “And We created you in pairs.”
          </div>

          <div className="quran-reference">
            An-Naba | Verse 8
          </div>

          <div className="family-name">
            Mr &amp; Mrs Advocate Ashraf Ali
          </div>

          <div className="family-line">
            Granddaughter of Mr &amp; Mrs Sheikh Abdul Latif
            (Late) &amp; Mr &amp; Mrs. Wasi Uddin Warsi (Late)
          </div>

          <div className="invite-line">
            Cordially Invite You To The
          </div>

          <h2 className="ceremony-title">
            BARAAT CEREMONY
          </h2>

          <div className="invite-line">
            Of Their Beloved Daughter
          </div>

          {/* ================= PHOTOS ================= */}

          <div className="couple-photos">

            <div className="photo-only">
              <img
                src="/images/baraat-bride.png"
                alt="Bride"
                className="couple-image"
              />
            </div>

            <div className="photo-only">
              <img
                src="/images/baraat-groom.png"
                alt="Groom"
                className="couple-image"
              />
            </div>

          </div>

          <div className="love-heading">
            TWO HEARTS, TWO FAMILIES,
            <br />
            ONE BEAUTIFUL BEGINNING.
          </div>

          <p className="intro-text">
            With immense joy and happiness, we invite you
            to join us as we celebrate the beautiful
            beginning of a new journey.
          </p>

          <p className="intro-text">
            Your presence, prayers and blessings will make
            these precious moments even more meaningful
            and special to us.
          </p>

        </section>

        {/* ================= SCRATCH CARD ================= */}

        <section className="scratch-section">

          <div className="scratch-card">

            {!scratched && (
              <canvas
                ref={canvasRef}
                className="scratch-canvas"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={stopScratching}
                onPointerCancel={stopScratching}
                onPointerLeave={stopScratching}
              />
            )}

            <div className="revealed-date">

              <div className="date-main">
                31 OCTOBER 2026
              </div>

              <div className="date-day">
                SATURDAY
              </div>

            </div>

          </div>

          {scratched && (
            <div className="date-gift-message">

              <div className="gift-title">
                NO BOX GIFTS PLEASE
              </div>

              <div className="gift-text">
                Your presence, love and blessings are
                more than enough for us.
              </div>

            </div>
          )}

        </section>

        {/* ================= BARAAT ================= */}

        <section className="content-section">

          <div className="section-kicker">
            THE BARAAT
          </div>

          <div className="countdown">

            <div className="countdown-item">
              <span>
                {timeLeft.days}
              </span>
              <small>DAYS</small>
            </div>

            <div className="countdown-item">
              <span>
                {timeLeft.hours}
              </span>
              <small>HOURS</small>
            </div>

            <div className="countdown-item">
              <span>
                {timeLeft.minutes}
              </span>
              <small>MINUTES</small>
            </div>

            <div className="countdown-item">
              <span>
                {timeLeft.seconds}
              </span>
              <small>SECONDS</small>
            </div>

          </div>

          <button
            className="gold-button"
            type="button"
            onClick={addToCalendar}
          >
            ADD TO CALENDAR
          </button>

        </section>

        {/* ================= VENUE ================= */}

        <section className="content-section">

          <div className="section-kicker">
            THE VENUE
          </div>

          <h3>
            The Manor Banquet
          </h3>

          <div className="venue-address">
            Shahra-e-Faisal
            <br />
            Darwaish Colony
            <br />
            Karachi
          </div>

          <a
            className="gold-button link-button"
            href="https://maps.app.goo.gl/9kn7oBToppmW7R9f6"
            target="_blank"
            rel="noreferrer"
          >
            VIEW DIRECTIONS
          </a>

        </section>

        {/* ================= PROGRAMME ================= */}

        <section className="content-section programme-section">

          <div className="section-kicker">
            THE PROGRAMME
          </div>

          <div className="programme-list">

            <div className="programme-item">
              <div className="programme-time">
                09:00 PM
              </div>

              <div className="programme-name">
                Arrival Of Baraat
              </div>
            </div>

            <div className="programme-item">
              <div className="programme-time">
                10:00 PM
              </div>

              <div className="programme-name">
                Dinner
              </div>
            </div>

            <div className="programme-item">
              <div className="programme-time">
                11:00 PM
              </div>

              <div className="programme-name">
                Rukhsati
              </div>
            </div>

          </div>

        </section>

        {/* ================= WELCOME ================= */}

        <section className="content-section welcome-section">

          <div className="section-kicker">
            WELCOME
          </div>

          <p className="welcome-text">
            We would be honoured to have you with us
            as we celebrate this beautiful beginning
            surrounded by the people we love.
          </p>

          <div className="large-ornament">
            ❦
          </div>

        </section>

        {/* ================= RSVP ================= */}

        <section className="content-section rsvp-section">

          <div className="section-kicker">
            RSVP
          </div>

          <div className="rsvp-name">
            Advocate Ashraf Ali
          </div>

          <a
            href="tel:03342595325"
            className="rsvp-phone"
          >
            03342595325
          </a>

          <div className="large-ornament">
            ❦
          </div>

          <div className="with-love">
            WITH LOVE &amp; BLESSINGS
          </div>

          <div className="large-ornament">
            ❦
          </div>

        </section>

      </main>

      {/* ================= MUSIC BUTTON ================= */}

      {invitationOpen && (
        <button
          className={`music-button ${
            musicPlaying
              ? "music-button-playing"
              : ""
          }`}
          onClick={toggleMusic}
          type="button"
          aria-label={
            musicPlaying
              ? "Pause music"
              : "Play music"
          }
        >
          <span className="music-icon">
            {musicPlaying ? "Ⅱ" : "♪"}
          </span>
        </button>
      )}

    </div>
  );
}

export default Baraat;
