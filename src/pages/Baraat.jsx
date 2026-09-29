import { useEffect, useRef, useState } from "react";
import "./Baraat.css";

const EVENT_DATE = new Date("2026-10-31T22:00:00+05:00").getTime();

const MUSIC_VIDEO_ID = "8mYeTuzBQr4";
const MUSIC_START = 15;

const DIRECTIONS_URL =
  "https://maps.app.goo.gl/9kn7oBToppmW7R9f6";

function Baraat() {
  const [invitationOpen, setInvitationOpen] = useState(false);
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [openingVisible, setOpeningVisible] = useState(true);

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
     PREVENT SCROLL WHILE OPENING
  ========================= */

  useEffect(() => {
    document.body.style.overflow = openingVisible ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [openingVisible]);

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

      const totalSeconds = Math.floor(difference / 1000);

      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

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
      if (!window.YT || !window.YT.Player) {
        return;
      }

      if (playerRef.current) {
        return;
      }

      playerRef.current = new window.YT.Player(
        "baraat-youtube-player",
        {
          height: "1",
          width: "1",
          videoId: MUSIC_VIDEO_ID,
          playerVars: {
            autoplay: 0,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            origin: window.location.origin,
            enablejsapi: 1,
          },
          events: {
            onReady: (event) => {
              playerReadyRef.current = true;

              if (pendingMusicRef.current) {
                try {
                  event.target.seekTo(MUSIC_START, true);
                  event.target.playVideo();

                  musicStartedRef.current = true;
                  setMusicPlaying(true);
                } catch (error) {
                  console.warn(
                    "Music could not start automatically.",
                    error
                  );
                }
              }
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

              if (
                window.YT &&
                event.data === window.YT.PlayerState.ENDED
              ) {
                setMusicPlaying(false);
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

      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;

      document.body.appendChild(script);
    }

    const previousCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousCallback === "function") {
        previousCallback();
      }

      createPlayer();
    };

    return () => {
      if (window.onYouTubeIframeAPIReady) {
        window.onYouTubeIframeAPIReady = previousCallback;
      }
    };
  }, []);

  /* =========================
     OPEN INVITATION
  ========================= */

  const openInvitation = () => {
    if (invitationOpen) {
      return;
    }

    setInvitationOpen(true);

    /*
      Keep the music request tied directly
      to the user's tap.
    */

    pendingMusicRef.current = true;

    if (
      playerRef.current &&
      playerReadyRef.current
    ) {
      try {
        playerRef.current.seekTo(MUSIC_START, true);
        playerRef.current.playVideo();

        musicStartedRef.current = true;
        setMusicPlaying(true);
      } catch (error) {
        console.warn(
          "Music could not start automatically.",
          error
        );
      }
    }

    /*
      Open the curtains after the
      invitation has been triggered.
    */

    setTimeout(() => {
      setCurtainsOpen(true);
    }, 120);

    /*
      Hide the opening screen only after
      the curtain animation has finished.
    */

    setTimeout(() => {
      setOpeningVisible(false);
    }, 2050);
  };

  /* =========================
     MUSIC BUTTON
  ========================= */

  const toggleMusic = () => {
    if (!playerRef.current || !playerReadyRef.current) {
      return;
    }

    try {
      if (musicPlaying) {
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
      console.warn("Music control error.", error);
    }
  };

  /* =========================
     SCRATCH CARD
  ========================= */

  useEffect(() => {
    if (scratched) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect();

      const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      canvas.width = Math.max(
        1,
        Math.floor(rect.width * dpr)
      );

      canvas.height = Math.max(
        1,
        Math.floor(rect.height * dpr)
      );

      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      context.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      context.globalCompositeOperation =
        "source-over";

      const gradient = context.createLinearGradient(
        0,
        0,
        rect.width,
        rect.height
      );

      gradient.addColorStop(
        0,
        "#c8a65b"
      );

      gradient.addColorStop(
        0.5,
        "#9d7435"
      );

      gradient.addColorStop(
        1,
        "#d5b86e"
      );

      context.fillStyle = gradient;

      context.fillRect(
        0,
        0,
        rect.width,
        rect.height
      );

      context.fillStyle =
        "rgba(255,255,255,0.22)";

      context.font =
        "600 13px Georgia, serif";

      context.textAlign = "center";
      context.textBaseline = "middle";

      context.fillText(
        "SCRATCH TO REVEAL",
        rect.width / 2,
        rect.height / 2
      );
    };

    setupCanvas();

    window.addEventListener(
      "resize",
      setupCanvas
    );

    return () => {
      window.removeEventListener(
        "resize",
        setupCanvas
      );
    };
  }, [scratched]);

  const getScratchPosition = (event) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return null;
    }

    const rect =
      canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handlePointerDown = (event) => {
    const canvas = canvasRef.current;

    if (!canvas || scratched) {
      return;
    }

    event.preventDefault();

    scratchingRef.current = true;

    try {
      canvas.setPointerCapture(
        event.pointerId
      );
    } catch {
      // Some browsers may not support pointer capture.
    }

    scratchAtPosition(event);
  };

  const handlePointerMove = (event) => {
    if (
      !scratchingRef.current ||
      scratched
    ) {
      return;
    }

    event.preventDefault();

    scratchAtPosition(event);
  };

  const handlePointerUp = (event) => {
    scratchingRef.current = false;

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    try {
      canvas.releasePointerCapture(
        event.pointerId
      );
    } catch {
      // Ignore if pointer capture was not active.
    }
  };

  const scratchAtPosition = (event) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const position =
      getScratchPosition(event);

    if (!position) {
      return;
    }

    const rect =
      canvas.getBoundingClientRect();

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    const context =
      canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.save();

    context.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    context.globalCompositeOperation =
      "destination-out";

    context.beginPath();

    context.arc(
      position.x,
      position.y,
      22,
      0,
      Math.PI * 2
    );

    context.fill();

    context.restore();

    /*
      Check how much of the scratch layer
      has been removed.
    */

    if (Math.random() > 0.92) {
      const checkCanvas =
        document.createElement("canvas");

      const sampleWidth = 80;
      const sampleHeight = 50;

      checkCanvas.width = sampleWidth;
      checkCanvas.height = sampleHeight;

      const checkContext =
        checkCanvas.getContext("2d");

      if (!checkContext) {
        return;
      }

      checkContext.drawImage(
        canvas,
        0,
        0,
        rect.width,
        rect.height,
        0,
        0,
        sampleWidth,
        sampleHeight
      );

      const pixels =
        checkContext.getImageData(
          0,
          0,
          sampleWidth,
          sampleHeight
        ).data;

      let transparentPixels = 0;

      for (
        let i = 3;
        i < pixels.length;
        i += 4
      ) {
        if (pixels[i] < 60) {
          transparentPixels += 1;
        }
      }

      const percentage =
        transparentPixels /
        (sampleWidth * sampleHeight);

      if (percentage > 0.42) {
        setScratched(true);
      }
    }
  };

  /* =========================
     GOOGLE CALENDAR
  ========================= */

  const addToCalendar = () => {
    const title =
      "Baraat Ceremony";

    const location =
      "The Manor Banquet, Shahra-e-Faisal, Darwaish Colony, Karachi";

    const start =
      "20261031T210000";

    const end =
      "20261031T235900";

    const googleCalendarUrl =
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(title)}` +
      `&dates=${start}/${end}` +
      `&details=${encodeURIComponent(
        "Baraat Ceremony"
      )}` +
      `&location=${encodeURIComponent(
        location
      )}` +
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
          HIDDEN YOUTUBE PLAYER
      ========================= */}

      <div
        className="youtube-player-hidden"
        aria-hidden="true"
      >
        <div
          id="baraat-youtube-player"
          style={{
            width: "1px",
            height: "1px",
          }}
        />
      </div>

      {/* =========================
          INVITATION
      ========================= */}

      <main
        className={`invitation ${
          invitationOpen
            ? "invitation-visible"
            : ""
        }`}
      >

        {/* =========================
            HERO / QURAN
        ========================= */}

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
              Granddaughter of Mr &amp; Mrs Sheikh Abdul Latif
              (Late) &amp; Mr &amp; Mrs. Wasi Uddin Warsi (Late)
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

          {/* PLAIN PHOTOS */}

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
              With immense joy and happiness, we invite you
              to join us as we celebrate the beautiful
              beginning of a new journey.
            </p>

            <p>
              Your presence, prayers and blessings will make
              these precious moments even more meaningful
              and special to us.
            </p>

          </div>

        </section>

        {/* =========================
            SCRATCH CARD
        ========================= */}

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
                  Your presence, love and blessings are
                  more than enough for us.
                </p>

              </div>
            )}

          </div>

        </section>

        {/* =========================
            THE BARAAT
        ========================= */}

        <section className="content-section countdown-section">

          <div className="section-label">
            THE BARAAT
          </div>

          <div className="countdown">

            <div className="countdown-item">
              <span>{timeLeft.days}</span>
              <small>DAYS</small>
            </div>

            <div className="countdown-item">
              <span>{timeLeft.hours}</span>
              <small>HOURS</small>
            </div>

            <div className="countdown-item">
              <span>{timeLeft.minutes}</span>
              <small>MINUTES</small>
            </div>

            <div className="countdown-item">
              <span>{timeLeft.seconds}</span>
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

        {/* =========================
            VENUE
        ========================= */}

        <section className="content-section venue-section">

          <div className="section-label">
            THE VENUE
          </div>

          <h2 className="venue-name">
            The Manor Banquet
          </h2>

          <p>Shahra-e-Faisal</p>
          <p>Darwaish Colony</p>
          <p>Karachi</p>

          <a
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="directions-button"
          >
            VIEW DIRECTIONS
          </a>

        </section>

        {/* =========================
            PROGRAMME
        ========================= */}

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

        {/* =========================
            WELCOME
        ========================= */}

        <section className="content-section welcome-section">

          <div className="section-label">
            WELCOME
          </div>

          <p>
            We would be honoured to have you with us
            as we celebrate this beautiful beginning
            surrounded by the people we love.
          </p>

        </section>

        {/* =========================
            RSVP
        ========================= */}

        <section className="content-section rsvp-section">

          <div className="section-label">
            RSVP
          </div>

          <h2>
            Advocate Ashraf Ali
          </h2>

          <a
            href="tel:03342595325"
            className="phone-link"
          >
            03342595325
          </a>

        </section>

        {/* =========================
            FOOTER
        ========================= */}

        <footer className="invitation-footer">

          <div className="footer-ornament">
            ❦
          </div>

          <div className="footer-love">
            WITH LOVE &amp; BLESSINGS
          </div>

          <div className="footer-ornament">
            ❦
          </div>

        </footer>

      </main>

      {/* =========================
          OPENING SCREEN
          ========================= */}

      {openingVisible && (
        <section
          className={`opening-screen ${
            invitationOpen
              ? "opening-screen-opening"
              : ""
          } ${
            !openingVisible
              ? "opening-screen-hidden"
              : ""
          }`}
          aria-label="Baraat invitation opening"
        >

          <div className="opening-glow" />

          {/* OPENING WORDING */}

          <div
            className={`opening-content ${
              invitationOpen
                ? "opening-content-fade"
                : ""
            }`}
          >

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

          {/* GOLD CENTRE DETAIL */}

          <div
            className={`curtain-centre-detail ${
              curtainsOpen
                ? "curtain-centre-detail-open"
                : ""
            }`}
          >
            <span />
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

            <div className="curtain-tassel">
              ❦
            </div>

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

            <div className="curtain-tassel">
              ❦
            </div>

          </div>

        </section>
      )}

      {/* =========================
          MUSIC BUTTON
      ========================= */}

      <button
        type="button"
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
        <span className="music-icon">
          {musicPlaying ? "Ⅱ" : "♪"}
        </span>

        <span className="music-text">
          {musicPlaying
            ? "MUSIC ON"
            : "MUSIC"}
        </span>
      </button>

    </div>
  );
}

export default Baraat;
