import { useEffect, useRef, useState } from "react";
import "./Baraat.css";

const EVENT_DATE = new Date("2026-10-31T22:00:00+05:00").getTime();

const MUSIC_VIDEO_ID = "8mYeTuzBQr4";
const MUSIC_START = 10;

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
  const scratchCanvasReadyRef = useRef(false);

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  /* ---------------- COUNTDOWN ---------------- */

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const difference = EVENT_DATE - now;

      if (difference <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
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

      setCountdown({
        days,
        hours,
        minutes,
        seconds,
      });
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  /* ---------------- YOUTUBE MUSIC ---------------- */

  useEffect(() => {
    const loadYouTube = () => {
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
        document.body.appendChild(script);
      }

      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };
    };

    const createPlayer = () => {
      if (playerRef.current) return;

      const playerElement = document.getElementById(
        "youtube-player"
      );

      if (!playerElement) return;

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
          },
          events: {
            onReady: (event) => {
              try {
                event.target.setVolume(80);
                event.target.seekTo(MUSIC_START, true);

                if (pendingMusicStartRef.current) {
                  event.target.playVideo();
                  musicStartedRef.current = true;
                  pendingMusicStartRef.current = false;
                  setMusicPlaying(true);
                }
              } catch (error) {
                console.log("YouTube player error:", error);
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
            },
          },
        }
      );
    };

    loadYouTube();

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  /* ---------------- OPEN INVITATION ---------------- */

  const openInvitation = () => {
    setInvitationOpen(true);
    setCurtainsOpen(false);

    pendingMusicStartRef.current = true;

    setTimeout(() => {
      setCurtainsOpen(true);
    }, 100);

    if (playerRef.current) {
      try {
        playerRef.current.seekTo(MUSIC_START, true);
        playerRef.current.playVideo();

        musicStartedRef.current = true;
        pendingMusicStartRef.current = false;
        setMusicPlaying(true);
      } catch (error) {
        console.log("Music could not start:", error);
      }
    }
  };

  /* ---------------- MUSIC BUTTON ---------------- */

  const toggleMusic = () => {
    if (!playerRef.current) return;

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
      console.log("Music toggle error:", error);
    }
  };

  /* ---------------- SCRATCH CARD ---------------- */

  useEffect(() => {
    if (!invitationOpen) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect();

      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));

      const ratio = window.devicePixelRatio || 1;

      canvas.width = width * ratio;
      canvas.height = height * ratio;

      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      ctx.scale(ratio, ratio);

      ctx.globalCompositeOperation = "source-over";

      ctx.fillStyle = "#7d252b";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#f8f1e5";
      ctx.font =
        '600 15px "Montserrat", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.letterSpacing = "2px";

      ctx.fillText(
        "SCRATCH TO REVEAL",
        width / 2,
        height / 2
      );

      scratchCanvasReadyRef.current = true;
    };

    const timer = setTimeout(setupCanvas, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [invitationOpen]);

  const scratch = (event) => {
    const canvas = canvasRef.current;

    if (!canvas || !scratchCanvasReadyRef.current) return;

    const rect = canvas.getBoundingClientRect();

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

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";

    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();
  };

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;

    if (!canvas || scratched) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const imageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    let transparentPixels = 0;

    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] < 100) {
        transparentPixels++;
      }
    }

    const percentage =
      transparentPixels /
      (canvas.width * canvas.height);

    if (percentage > 0.45) {
      setScratched(true);
    }
  };

  const handlePointerDown = (event) => {
    scratchingRef.current = true;

    try {
      event.currentTarget.setPointerCapture?.(
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
      event.currentTarget.releasePointerCapture?.(
        event.pointerId
      );
    } catch {
      // Ignore pointer capture errors.
    }

    checkScratchPercentage();
  };

  /* ---------------- CALENDAR ---------------- */

  const addToCalendar = () => {
    const title = "Baraat Ceremony";

    const location =
      "The Manor Banquet, Shahra-e-Faisal, Darwaish Colony, Karachi";

    const start = "20261031T210000";
    const end = "20261031T235900";

    const googleCalendarUrl =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(title)}` +
      `&dates=${start}/${end}` +
      `&location=${encodeURIComponent(location)}` +
      "&ctz=Asia%2FKarachi";

    window.open(
      googleCalendarUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="baraat-page">

      {/* ================= OPENING SCREEN ================= */}

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
                className="open-invitation-button"
                onClick={openInvitation}
              >
                TAP TO OPEN
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ================= INVITATION ================= */}

      {invitationOpen && (
        <>

          {/* CURTAINS */}

          <div
            className={`opening-curtain ${
              curtainsOpen ? "curtains-open" : ""
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

          {/* MUSIC */}

          <button
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

          {/* ================= HERO ================= */}

          <main className="invitation-content">

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

              {/* COUPLE IMAGES */}

              <div className="couple-images">

                <div className="couple-image-wrapper">
                  <img
                    src="/images/baraat-bride.png"
                    alt="Bride"
                    className="couple-image"
                  />
                </div>

                <div className="couple-image-wrapper">
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

                <div className="scratch-card">

                  {!scratched && (
                    <canvas
                      ref={canvasRef}
                      className="scratch-canvas"
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      onPointerLeave={handlePointerUp}
                    />
                  )}

                  <div
                    className={`revealed-date ${
                      scratched
                        ? "revealed"
                        : ""
                    }`}
                  >
                    <div className="date-number">
                      31 OCTOBER 2026
                    </div>

                    <div className="date-day">
                      SATURDAY
                    </div>
                  </div>

                </div>

                <div className="scratch-hint">
                  Gently scratch the card to reveal
                  our special day
                </div>

              </div>

              {/* NO BOX GIFTS */}

              <div className="gift-message date-gift-message">

                <div className="gift-title">
                  NO BOX GIFTS PLEASE
                </div>

                <p>
                  Your presence, love and blessings are
                  more than enough for us.
                </p>

              </div>

            </section>

            {/* ================= COUNTDOWN ================= */}

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
                  className="calendar-button"
                  onClick={addToCalendar}
                >
                  ADD TO CALENDAR
                </button>

              </div>

            </section>

            {/* ================= VENUE ================= */}

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

            {/* ================= PROGRAMME ================= */}

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

            {/* ================= WELCOME ================= */}

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

            {/* ================= RSVP ================= */}

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

            {/* ================= FOOTER ================= */}

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
