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
  const pendingMusicStartRef = useRef(false);

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  /* =========================================================
     COUNTDOWN
  ========================================================= */

  useEffect(() => {
    const updateCountdown = () => {
      const difference = EVENT_DATE - Date.now();

      if (difference <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        return;
      }

      setCountdown({
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

  /* =========================================================
     YOUTUBE MUSIC
  ========================================================= */

  useEffect(() => {
    const createPlayer = () => {
      if (playerRef.current) return;

      const element =
        document.getElementById("youtube-player");

      if (!element || !window.YT?.Player) return;

      playerRef.current = new window.YT.Player(
        "youtube-player",
        {
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
              try {
                event.target.setVolume(85);
                event.target.seekTo(
                  MUSIC_START,
                  true
                );

                if (
                  pendingMusicStartRef.current
                ) {
                  event.target.playVideo();

                  musicStartedRef.current =
                    true;

                  pendingMusicStartRef.current =
                    false;

                  setMusicPlaying(true);
                }
              } catch (error) {
                console.log(
                  "Music could not start:",
                  error
                );
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
            },
          },
        }
      );
    };

    if (
      window.YT &&
      window.YT.Player
    ) {
      createPlayer();
      return;
    }

    const existingScript =
      document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      );

    if (!existingScript) {
      const script =
        document.createElement("script");

      script.src =
        "https://www.youtube.com/iframe_api";

      document.body.appendChild(script);
    }

    window.onYouTubeIframeAPIReady =
      createPlayer;

    return () => {
      window.onYouTubeIframeAPIReady =
        null;
    };
  }, []);

  /* =========================================================
     OPEN INVITATION
  ========================================================= */

  const openInvitation = () => {
    setInvitationOpen(true);

    setCurtainsOpen(false);

    pendingMusicStartRef.current = true;

    /*
      The click itself is the user's interaction,
      so we attempt to start the YouTube player here.
    */

    if (playerRef.current) {
      try {
        playerRef.current.seekTo(
          MUSIC_START,
          true
        );

        playerRef.current.playVideo();

        musicStartedRef.current = true;

        pendingMusicStartRef.current = false;

        setMusicPlaying(true);
      } catch (error) {
        console.log(
          "Music could not start:",
          error
        );
      }
    }

    setTimeout(() => {
      setCurtainsOpen(true);
    }, 120);
  };

  /* =========================================================
     MUSIC BUTTON
  ========================================================= */

  const toggleMusic = () => {
    if (!playerRef.current) return;

    try {
      if (musicPlaying) {
        playerRef.current.pauseVideo();
        setMusicPlaying(false);
        return;
      }

      if (!musicStartedRef.current) {
        playerRef.current.seekTo(
          MUSIC_START,
          true
        );

        musicStartedRef.current = true;
      }

      playerRef.current.playVideo();

      setMusicPlaying(true);
    } catch (error) {
      console.log(
        "Music toggle error:",
        error
      );
    }
  };

  /* =========================================================
     SCRATCH CARD SETUP
  ========================================================= */

  useEffect(() => {
    if (!invitationOpen) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const setupCanvas = () => {
      const rect =
        canvas.getBoundingClientRect();

      const width = Math.max(
        1,
        Math.round(rect.width)
      );

      const height = Math.max(
        1,
        Math.round(rect.height)
      );

      const ratio =
        window.devicePixelRatio || 1;

      canvas.width =
        width * ratio;

      canvas.height =
        height * ratio;

      const ctx =
        canvas.getContext("2d");

      if (!ctx) return;

      ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
      );

      ctx.globalCompositeOperation =
        "source-over";

      /* Burgundy scratch layer */

      const gradient =
        ctx.createLinearGradient(
          0,
          0,
          width,
          height
        );

      gradient.addColorStop(
        0,
        "#5d121b"
      );

      gradient.addColorStop(
        0.5,
        "#7d252b"
      );

      gradient.addColorStop(
        1,
        "#4a0d14"
      );

      ctx.fillStyle = gradient;

      ctx.fillRect(
        0,
        0,
        width,
        height
      );

      /* Gold border effect */

      ctx.strokeStyle =
        "rgba(225, 199, 125, 0.55)";

      ctx.lineWidth = 1;

      ctx.strokeRect(
        1,
        1,
        width - 2,
        height - 2
      );

      /* Scratch instruction */

      ctx.fillStyle =
        "#fffaf0";

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.font =
        '500 12px "Montserrat", sans-serif';

      ctx.fillText(
        "SCRATCH TO REVEAL",
        width / 2,
        height / 2 - 5
      );

      ctx.font =
        '400 9px "Montserrat", sans-serif';

      ctx.fillStyle =
        "#e1c77d";

      ctx.fillText(
        "Gently scratch the card",
        width / 2,
        height / 2 + 18
      );
    };

    const timer = setTimeout(
      setupCanvas,
      100
    );

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
      clearTimeout(timer);

      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [invitationOpen, scratched]);

  /* =========================================================
     SCRATCH FUNCTION
  ========================================================= */

  const scratch = (event) => {
    if (scratched) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const rect =
      canvas.getBoundingClientRect();

    const clientX =
      event.clientX ??
      event.touches?.[0]?.clientX;

    const clientY =
      event.clientY ??
      event.touches?.[0]?.clientY;

    if (
      typeof clientX !== "number" ||
      typeof clientY !== "number"
    ) {
      return;
    }

    const x =
      clientX - rect.left;

    const y =
      clientY - rect.top;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) return;

    /*
      Use destination-out so the
      scratch layer becomes transparent.
    */

    ctx.globalCompositeOperation =
      "destination-out";

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      28,
      0,
      Math.PI * 2
    );

    ctx.fill();

    checkScratchPercentage();
  };

  /* =========================================================
     CHECK HOW MUCH HAS BEEN SCRATCHED
  ========================================================= */

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;

    if (!canvas || scratched) return;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) return;

    const imageData =
      ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

    let transparentPixels = 0;

    /*
      Check alpha values.
    */

    for (
      let i = 3;
      i < imageData.data.length;
      i += 4
    ) {
      if (imageData.data[i] < 80) {
        transparentPixels++;
      }
    }

    const totalPixels =
      canvas.width *
      canvas.height;

    const percentage =
      transparentPixels /
      totalPixels;

    /*
      Reveal after 45%.
    */

    if (percentage >= 0.45) {
      setScratched(true);
    }
  };

  /* =========================================================
     POINTER EVENTS
  ========================================================= */

  const handlePointerDown = (event) => {
    if (scratched) return;

    scratchingRef.current = true;

    try {
      event.currentTarget.setPointerCapture(
        event.pointerId
      );
    } catch {
      // Ignore pointer capture errors.
    }

    scratch(event);
  };

  const handlePointerMove = (event) => {
    if (!scratchingRef.current) return;

    scratch(event);
  };

  const handlePointerUp = (event) => {
    scratchingRef.current = false;

    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    } catch {
      // Ignore pointer capture errors.
    }

    checkScratchPercentage();
  };

  /* =========================================================
     GOOGLE CALENDAR
  ========================================================= */

  const addToCalendar = () => {
    const title =
      "Baraat Ceremony";

    const location =
      "The Manor Banquet, Shahra-e-Faisal, Darwaish Colony, Karachi";

    const start =
      "20261031T210000";

    const end =
      "20261031T235900";

    const url =
      "https://calendar.google.com/calendar/render" +
      "?action=TEMPLATE" +
      `&text=${encodeURIComponent(title)}` +
      `&dates=${start}/${end}` +
      `&location=${encodeURIComponent(location)}` +
      "&ctz=Asia%2FKarachi";

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="baraat-page">

      {/* =====================================================
          OPENING SCREEN
      ===================================================== */}

      {!invitationOpen && (
        <div className="opening-screen">

          <div className="youtube-player-wrapper">
            <div
              id="youtube-player"
              className="youtube-player"
            />
          </div>

          <div className="opening-glow" />

          <div className="opening-frame">

            <div className="corner corner-top-left">
              ❦
            </div>

            <div className="corner corner-top-right">
              ❦
            </div>

            <div className="corner corner-bottom-left">
              ❦
            </div>

            <div className="corner corner-bottom-right">
              ❦
            </div>

            <div className="opening-content">

              <div className="opening-bismillah">
                ﷽
              </div>

              <div className="opening-small">
                THE WEDDING CELEBRATION
              </div>

              <div className="opening-divider">
                ❦
              </div>

              <h1>BARAAT</h1>

              <div className="opening-subtitle">
                A Celebration of Love
              </div>

              <button
                type="button"
                className="open-invitation-button"
                onClick={openInvitation}
              >
                TAP TO OPEN
              </button>

            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          INVITATION
      ===================================================== */}

      {invitationOpen && (
        <>

          {/* CURTAINS */}

          <div
            className={`opening-curtain ${
              curtainsOpen
                ? "curtains-open"
                : ""
            }`}
          >

            <div className="curtain-panel curtain-left">
              <div className="curtain-shine" />
              <div className="curtain-folds" />

              <div className="curtain-tassel">
                ❦
              </div>
            </div>

            <div className="curtain-panel curtain-right">
              <div className="curtain-shine" />
              <div className="curtain-folds" />

              <div className="curtain-tassel">
                ❦
              </div>
            </div>

            <div className="curtain-centre" />

          </div>

          {/* MUSIC BUTTON */}

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

          {/* =================================================
              MAIN INVITATION
          ================================================= */}

          <main className="invitation-content">

            {/* HERO */}

            <section className="hero-section">

              <div className="hero-bismillah">
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
                Mr & Mrs Advocate Ashraf Ali
              </div>

              <div className="grandparents">
                Granddaughter of Mr & Mrs Sheikh Abdul Latif
                (Late) & Mr & Mrs. Wasi Uddin Warsi (Late)
              </div>

              <div className="invite-line">
                Cordially Invite You To The
              </div>

              <div className="ceremony-title">
                BARAAT CEREMONY
              </div>

              <div className="beloved-line">
                Of Their Beloved Daughter
              </div>

              {/* PHOTOS — NO FRAME */}

              <div className="couple-images">

                <img
                  src="/images/baraat-bride.png"
                  alt="Bride"
                  className="couple-image"
                />

                <img
                  src="/images/baraat-groom.png"
                  alt="Groom"
                  className="couple-image"
                />

              </div>

              <div className="love-heading">
                TWO HEARTS, TWO FAMILIES,
                <br />
                ONE BEAUTIFUL BEGINNING.
              </div>

              <div className="hero-message">

                <p>
                  With immense joy and happiness, we invite
                  you to join us as we celebrate the beautiful
                  beginning of a new journey.
                </p>

                <p>
                  Your presence, prayers and blessings will
                  make these precious moments even more
                  meaningful and special to us.
                </p>

              </div>

              {/* SCRATCH DATE */}

              <div className="scratch-date-section">

                <div
                  className={`scratch-card ${
                    scratched
                      ? "scratch-complete"
                      : ""
                  }`}
                >

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

                </div>

                {!scratched && (
                  <div className="scratch-hint">
                    Gently scratch the card to reveal
                    our special day
                  </div>
                )}

              </div>

              {/* NO BOX GIFTS — ONLY AFTER SCRATCH */}

              {scratched && (
                <div className="gift-message date-gift-message">

                  <div className="gift-title">
                    NO BOX GIFTS PLEASE
                  </div>

                  <p>
                    Your presence, love and blessings
                    are more than enough for us.
                  </p>

                </div>
              )}

            </section>

            {/* =================================================
                COUNTDOWN
            ================================================= */}

            <section className="countdown-section">

              <div className="section-heading">
                THE BARAAT
              </div>

              <div className="countdown">

                <div className="countdown-box">
                  <span>
                    {countdown.days}
                  </span>
                  <small>DAYS</small>
                </div>

                <div className="countdown-box">
                  <span>
                    {String(
                      countdown.hours
                    ).padStart(2, "0")}
                  </span>
                  <small>HOURS</small>
                </div>

                <div className="countdown-box">
                  <span>
                    {String(
                      countdown.minutes
                    ).padStart(2, "0")}
                  </span>
                  <small>MINUTES</small>
                </div>

                <div className="countdown-box">
                  <span>
                    {String(
                      countdown.seconds
                    ).padStart(2, "0")}
                  </span>
                  <small>SECONDS</small>
                </div>

              </div>

              <div className="after-countdown">

                <button
                  type="button"
                  className="calendar-button"
                  onClick={addToCalendar}
                >
                  ADD TO CALENDAR
                </button>

              </div>

            </section>

            {/* VENUE */}

            <section className="venue-section">

              <div className="section-heading">
                THE VENUE
              </div>

              <div className="venue-card">

                <div className="venue-name">
                  The Manor Banquet
                </div>

                <div className="venue-address">
                  Shahra-e-Faisal
                  <br />
                  Darwaish Colony
                  <br />
                  Karachi
                </div>

                <a
                  href="https://maps.app.goo.gl/9kn7oBToppmW7R9f6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="directions-button"
                >
                  VIEW DIRECTIONS
                </a>

              </div>

            </section>

            {/* PROGRAMME */}

            <section className="programme-section">

              <div className="section-heading">
                THE PROGRAMME
              </div>

              <div className="programme-list">

                <div className="programme-item">

                  <div className="programme-time">
                    09:00 PM
                  </div>

                  <div className="programme-event">
                    Arrival Of Baraat
                  </div>

                </div>

                <div className="programme-item">

                  <div className="programme-time">
                    10:00 PM
                  </div>

                  <div className="programme-event">
                    Dinner
                  </div>

                </div>

                <div className="programme-item">

                  <div className="programme-time">
                    11:00 PM
                  </div>

                  <div className="programme-event">
                    Rukhsati
                  </div>

                </div>

              </div>

            </section>

            {/* WELCOME */}

            <section className="welcome-section">

              <div className="section-heading">
                WELCOME
              </div>

              <p>
                We would be honoured to have you with us
                as we celebrate this beautiful beginning
                surrounded by the people we love.
              </p>

              <div className="welcome-ornament">
                ❦
              </div>

            </section>

            {/* RSVP */}

            <section className="rsvp-section">

              <div className="section-heading">
                RSVP
              </div>

              <div className="rsvp-card">

                <div className="rsvp-name">
                  Advocate Ashraf Ali
                </div>

                <a
                  href="tel:03342595325"
                  className="rsvp-phone"
                >
                  03342595325
                </a>

              </div>

            </section>

            {/* FOOTER */}

            <footer className="footer">

              <div className="footer-ornament">
                ❦
              </div>

              <div className="footer-text">
                WITH LOVE & BLESSINGS
              </div>

              <div className="footer-ornament">
                ❦
              </div>

            </footer>

          </main>
        </>
      )}

    </div>
  );
}

export default Baraat;
