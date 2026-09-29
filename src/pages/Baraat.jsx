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
  const pendingMusicRef = useRef(false);
  const playerReadyRef = useRef(false);

  /* =========================
     COUNTDOWN
  ========================= */

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

    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  /* =========================
     YOUTUBE MUSIC
  ========================= */

  useEffect(() => {
    const createPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      if (playerRef.current) return;

      playerRef.current = new window.YT.Player(
        "baraat-youtube-player",
        {
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
                console.log("YouTube setup error:", error);
              }

              if (pendingMusicRef.current) {
                try {
                  event.target.seekTo(MUSIC_START, true);
                  event.target.playVideo();

                  musicStartedRef.current = true;
                  setMusicPlaying(true);
                } catch (error) {
                  console.log(
                    "Music playback error:",
                    error
                  );
                }
              }
            },

            onStateChange: (event) => {
              if (
                window.YT &&
                event.data ===
                  window.YT.PlayerState.PLAYING
              ) {
                setMusicPlaying(true);
              }

              if (
                window.YT &&
                event.data ===
                  window.YT.PlayerState.PAUSED
              ) {
                setMusicPlaying(false);
              }

              if (
                window.YT &&
                event.data ===
                  window.YT.PlayerState.ENDED
              ) {
                try {
                  event.target.seekTo(MUSIC_START, true);
                  event.target.playVideo();
                } catch (error) {
                  console.log(
                    "Music loop error:",
                    error
                  );
                }
              }
            },
          },
        }
      );
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");

      script.src =
        "https://www.youtube.com/iframe_api";

      script.async = true;

      document.body.appendChild(script);
    }

    const previousCallback =
      window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      if (previousCallback) {
        previousCallback();
      }

      createPlayer();
    };

    return () => {
      window.onYouTubeIframeAPIReady =
        previousCallback;
    };
  }, []);

  /* =========================
     OPEN INVITATION
  ========================= */

  const openInvitation = () => {
    setInvitationOpen(true);

    pendingMusicRef.current = true;

    /*
      Music starts only after the user's tap.
      This keeps browser autoplay restrictions
      satisfied.
    */

    if (
      playerRef.current &&
      playerReadyRef.current
    ) {
      try {
        playerRef.current.seekTo(
          MUSIC_START,
          true
        );

        playerRef.current.playVideo();

        musicStartedRef.current = true;
        setMusicPlaying(true);
      } catch (error) {
        console.log(
          "Unable to start music:",
          error
        );
      }
    }

    /*
      Curtains open after the tap.
      The opening screen remains in the DOM
      only during the curtain animation.
    */

    requestAnimationFrame(() => {
      setTimeout(() => {
        setCurtainsOpen(true);
      }, 250);
    });
  };

  /* =========================
     MUSIC BUTTON
  ========================= */

  const toggleMusic = () => {
    if (
      !playerRef.current ||
      !playerReadyRef.current
    ) {
      return;
    }

    try {
      if (musicPlaying) {
        playerRef.current.pauseVideo();
        setMusicPlaying(false);
      } else {
        if (!musicStartedRef.current) {
          playerRef.current.seekTo(
            MUSIC_START,
            true
          );

          musicStartedRef.current = true;
        }

        playerRef.current.playVideo();
        setMusicPlaying(true);
      }
    } catch (error) {
      console.log(
        "Music button error:",
        error
      );
    }
  };

  /* =========================
     SCRATCH CARD
  ========================= */

  useEffect(() => {
    if (!invitationOpen) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!context) return;

    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect();

      const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      context.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      /*
        Burgundy scratch surface.
      */

      const gradient = context.createLinearGradient(
        0,
        0,
        rect.width,
        rect.height
      );

      gradient.addColorStop(
        0,
        "#3b0a12"
      );

      gradient.addColorStop(
        0.5,
        "#721522"
      );

      gradient.addColorStop(
        1,
        "#3d0a12"
      );

      context.fillStyle = gradient;
      context.fillRect(
        0,
        0,
        rect.width,
        rect.height
      );

      /*
        Inner gold border.
      */

      context.strokeStyle = "#d2af61";
      context.lineWidth = 1.5;

      context.strokeRect(
        10,
        10,
        rect.width - 20,
        rect.height - 20
      );

      /*
        Scratch instructions.
      */

      context.fillStyle = "#f3d995";
      context.textAlign = "center";
      context.textBaseline = "middle";

      context.font =
        "600 15px Montserrat, sans-serif";

      context.fillText(
        "SCRATCH TO REVEAL",
        rect.width / 2,
        rect.height / 2 - 12
      );

      context.fillStyle = "#fffaf0";

      context.font =
        "400 11px Montserrat, sans-serif";

      context.fillText(
        "Gently scratch the card",
        rect.width / 2,
        rect.height / 2 + 15
      );
    };

    setupCanvas();

    const handleResize = () => {
      if (!scratched) {
        setupCanvas();
      }
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [invitationOpen, scratched]);

  const getScratchPosition = (event) => {
    const canvas = canvasRef.current;

    if (!canvas) return null;

    const rect =
      canvas.getBoundingClientRect();

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
    } else if (
      event.changedTouches &&
      event.changedTouches.length > 0
    ) {
      clientX =
        event.changedTouches[0].clientX;

      clientY =
        event.changedTouches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const scratch = (event) => {
    if (scratched) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    const position =
      getScratchPosition(event);

    if (!position) return;

    context.save();

    context.globalCompositeOperation =
      "destination-out";

    context.beginPath();

    context.arc(
      position.x,
      position.y,
      30,
      0,
      Math.PI * 2
    );

    context.fill();

    context.restore();

    checkScratchProgress();
  };

  const checkScratchProgress = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!context) return;

    const width = canvas.width;
    const height = canvas.height;

    /*
      Check a smaller sample for performance,
      especially on iPhone.
    */

    const sampleWidth = Math.max(
      1,
      Math.floor(width / 4)
    );

    const sampleHeight = Math.max(
      1,
      Math.floor(height / 4)
    );

    const imageData =
      context.getImageData(
        0,
        0,
        width,
        height
      );

    let transparentPixels = 0;

    const totalPixels =
      width * height;

    /*
      Sample every few pixels.
    */

    for (
      let i = 3;
      i < imageData.data.length;
      i += 16
    ) {
      if (imageData.data[i] < 40) {
        transparentPixels++;
      }
    }

    const estimatedPercentage =
      (transparentPixels /
        (totalPixels / 4)) *
      100;

    if (estimatedPercentage >= 45) {
      setScratched(true);

      context.clearRect(
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

    event.preventDefault();

    scratch(event);
  };

  const handlePointerMove = (event) => {
    if (
      !scratchingRef.current ||
      scratched
    ) {
      return;
    }

    event.preventDefault();

    scratch(event);
  };

  const handlePointerUp = () => {
    scratchingRef.current = false;
  };

  /* =========================
     GOOGLE CALENDAR
  ========================= */

  const addToCalendar = () => {
    const title = "Baraat Ceremony";

    const location =
      "The Manor Banquet, Shahra-e-Faisal, Darwaish Colony, Karachi";

    const start = "20261031T210000";

    const end = "20261031T235900";

    const googleCalendarUrl =
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(title)}` +
      `&dates=${start}/${end}` +
      `&details=${encodeURIComponent(
        "Baraat Ceremony"
      )}` +
      `&location=${encodeURIComponent(location)}` +
      `&ctz=Asia/Karachi`;

    window.open(
      googleCalendarUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="baraat-page">

      {/* =========================
          YOUTUBE PLAYER
      ========================= */}

      <div
        className="youtube-player-hidden"
        aria-hidden="true"
      >
        <div id="baraat-youtube-player" />
      </div>

      {/* =========================
          OPENING SCREEN
      ========================= */}

      {!curtainsOpen && (
        <section
          className={`opening-screen ${
            invitationOpen
              ? "opening-screen-opening"
              : ""
          }`}
        >
          <div className="opening-glow" />

          <div className="opening-content">

            <p className="opening-small">
              THE WEDDING CELEBRATION
            </p>

            <div className="opening-ornament">
              ❦
            </div>

            <h1 className="opening-title">
              BARAAT
            </h1>

            <p className="opening-subtitle">
              A Celebration of Love
            </p>

            {!invitationOpen && (
              <button
                type="button"
                className="open-invitation-button"
                onClick={openInvitation}
              >
                TAP TO OPEN
              </button>
            )}

          </div>

          {/* LEFT CURTAIN */}

          <div
            className={`curtain curtain-left ${
              curtainsOpen
                ? "curtain-left-open"
                : ""
            }`}
          >
            <div className="curtain-folds" />
            <div className="curtain-gold-edge" />
          </div>

          {/* RIGHT CURTAIN */}

          <div
            className={`curtain curtain-right ${
              curtainsOpen
                ? "curtain-right-open"
                : ""
            }`}
          >
            <div className="curtain-folds" />
            <div className="curtain-gold-edge" />
          </div>
        </section>
      )}

      {/* =========================
          FULL INVITATION
      ========================= */}

      <main
        className={`invitation ${
          curtainsOpen
            ? "invitation-visible"
            : ""
        }`}
      >

        {/* HERO */}

        <section className="hero-section">

          <div className="quran-section">

            <div className="bismillah">
              ﷽
            </div>

            <div className="quran-arabic">
              وَخَلَقْنَاكُمْ أَزْوَاجًا
            </div>

            <div className="quran-translation">
              “And We created you in pairs.”
            </div>

            <div className="quran-reference">
              An-Naba | Verse 8
            </div>

          </div>

          <div className="family-section">

            <h2 className="family-name">
              Mr &amp; Mrs Advocate Ashraf Ali
            </h2>

            <p className="family-line">
              Granddaughter of Mr &amp; Mrs Sheikh
              Abdul Latif (Late) &amp; Mr &amp; Mrs.
              Wasi Uddin Warsi (Late)
            </p>

          </div>

          <div className="invite-heading">

            <p className="invite-small">
              Cordially Invite You To The
            </p>

            <h1 className="ceremony-title">
              BARAAT CEREMONY
            </h1>

            <p className="invite-small">
              Of Their Beloved Daughter
            </p>

          </div>

          {/* PLAIN PHOTOS — NO FRAME */}

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

          <div className="hero-message">

            <p>
              With immense joy and happiness,
              we invite you to join us as we
              celebrate the beautiful beginning
              of a new journey.
            </p>

            <p>
              Your presence, prayers and
              blessings will make these precious
              moments even more meaningful and
              special to us.
            </p>

          </div>

        </section>

        {/* SCRATCH CARD */}

        <section className="scratch-section">

          <div className="scratch-card">

            <div className="revealed-date">

              <div className="date-number">
                31 OCTOBER 2026
              </div>

              <div className="date-day">
                SATURDAY
              </div>

            </div>

            {!scratched && (
              <canvas
                ref={canvasRef}
                className="scratch-canvas"
                onPointerDown={
                  handlePointerDown
                }
                onPointerMove={
                  handlePointerMove
                }
                onPointerUp={
                  handlePointerUp
                }
                onPointerCancel={
                  handlePointerUp
                }
                onPointerLeave={
                  handlePointerUp
                }
              />
            )}

            {scratched && (
              <div className="scratch-revealed">

                <div className="date-gift-message">
                  NO BOX GIFTS PLEASE
                </div>

                <p className="gift-message">
                  Your presence, love and
                  blessings are more than
                  enough for us.
                </p>

              </div>
            )}

          </div>

        </section>

        {/* THE BARAAT */}

        <section className="content-section countdown-section">

          <div className="section-label">
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
            type="button"
            className="calendar-button"
            onClick={addToCalendar}
          >
            ADD TO CALENDAR
          </button>

        </section>

        {/* VENUE */}

        <section className="content-section venue-section">

          <div className="section-label">
            THE VENUE
          </div>

          <h2 className="venue-name">
            The Manor Banquet
          </h2>

          <p>
            Shahra-e-Faisal
          </p>

          <p>
            Darwaish Colony
          </p>

          <p>
            Karachi
          </p>

          <a
            href="https://maps.app.goo.gl/9kn7oBToppmW7R9f6"
            target="_blank"
            rel="noopener noreferrer"
            className="directions-button"
          >
            VIEW DIRECTIONS
          </a>

        </section>

        {/* PROGRAMME */}

        <section className="content-section programme-section">

          <div className="section-label">
            THE PROGRAMME
          </div>

          <div className="programme-list">

            <div className="programme-item">

              <span className="programme-time">
                09:00 PM
              </span>

              <span className="programme-event">
                Arrival Of Baraat
              </span>

            </div>

            <div className="programme-item">

              <span className="programme-time">
                10:00 PM
              </span>

              <span className="programme-event">
                Dinner
              </span>

            </div>

            <div className="programme-item">

              <span className="programme-time">
                11:00 PM
              </span>

              <span className="programme-event">
                Rukhsati
              </span>

            </div>

          </div>

        </section>

        {/* WELCOME */}

        <section className="content-section welcome-section">

          <div className="section-label">
            WELCOME
          </div>

          <p className="welcome-text">
            We would be honoured to have you
            with us as we celebrate this beautiful
            beginning surrounded by the people
            we love.
          </p>

          <div className="section-ornament">
            ❦
          </div>

        </section>

        {/* RSVP */}

        <section className="content-section rsvp-section">

          <div className="section-label">
            RSVP
          </div>

          <h2 className="rsvp-name">
            Advocate Ashraf Ali
          </h2>

          <a
            href="tel:03342595325"
            className="phone-number"
          >
            03342595325
          </a>

          <div className="section-ornament">
            ❦
          </div>

          <p className="with-love">
            WITH LOVE &amp; BLESSINGS
          </p>

          <div className="bottom-ornament">
            ❦
          </div>

        </section>

      </main>

      {/* =========================
          MUSIC BUTTON
      ========================= */}

      {curtainsOpen && (
        <button
          type="button"
          className="music-button"
          onClick={toggleMusic}
          aria-label={
            musicPlaying
              ? "Pause music"
              : "Play music"
          }
        >
          {musicPlaying ? "Ⅱ" : "▶"}
        </button>
      )}

    </div>
  );
}

export default Baraat;
