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
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const target = new Date("2026-10-31T22:00:00+05:00");

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
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
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
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.scale(dpr, dpr);

      ctx.fillStyle = "#d7c2a4";
      ctx.fillRect(0, 0, rect.width, rect.height);

      ctx.fillStyle = "#6e5740";
      ctx.font = "24px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "Gently scratch to reveal our special day",
        rect.width / 2,
        rect.height / 2
      );
    };

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const scratch = (event) => {
    if (scratched) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");

    const x =
      (event.clientX || event.touches?.[0]?.clientX) -
      rect.left;

    const y =
      (event.clientY || event.touches?.[0]?.clientY) -
      rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.fill();

    setTimeout(() => {
      setScratched(true);
    }, 1500);
  };

  const addToCalendar = () => {
    const event = {
      title: "Baraat Ceremony",
      location:
        "The Manor Banquet, Shahra-e-Faisal, Darwaish Colony, Karachi",
      start: "20261031T210000",
      end: "20261031T235900",
      timezone: "Asia/Karachi",
    };

    const url =
      `https://www.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(event.title)}` +
      `&dates=${event.start}/${event.end}` +
      `&details=${encodeURIComponent(
        "Baraat Ceremony"
      )}` +
      `&location=${encodeURIComponent(event.location)}` +
      `&ctz=${encodeURIComponent(event.timezone)}` +
      `&trp=true`;

    window.open(url, "_blank");
  };

  return (
    <div className="baraat-page">
      <section className="hero">
        <div className="hero-content">
          <div className="bismillah">﷽</div>

          <p className="parents">
            <strong>Mr & Mrs Advocate Ashraf Ali</strong>
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

          <h1>BARAAT CEREMONY</h1>

          <p className="daughter-text">
            Of Their Beloved Daughter
          </p>

          <div className="ornament">❦</div>
        </div>
      </section>

      <section className="date-section">
        <div className="ornament-small">✦</div>

        <p className="section-label">A DATE TO REMEMBER</p>

        <h2>Scratch to Reveal</h2>

        <div className="scratch-card">
          <div className="revealed-date">
            <strong>31 OCTOBER 2026</strong>
            <span>SATURDAY</span>
          </div>

          <canvas
            ref={canvasRef}
            onMouseMove={(event) => {
              if (event.buttons === 1) scratch(event);
            }}
            onTouchMove={scratch}
          />

          {!scratched && (
            <div className="scratch-overlay">
              <span>Gently scratch the card to reveal our special day</span>
            </div>
          )}
        </div>

        <p className="save-date">SAVE THE DATE</p>
      </section>

      <section className="countdown-section">
        <p className="section-label">The Baraat</p>

        <div className="countdown">
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

        <div className="ornament">❧</div>
      </section>

      <section className="venue-section">
        <p className="section-label">THE VENUE</p>

        <h2>The Manor Banquet</h2>

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

      <section className="programme-section">
        <p className="section-label">PROGRAMME</p>

        <h2>Evening Details</h2>

        <div className="programme-list">
          <div>
            <span>Arrival Of Baraat</span>
            <strong>09:00 PM</strong>
          </div>

          <div>
            <span>Dinner</span>
            <strong>10:00 PM</strong>
          </div>

          <div>
            <span>Rukhsati</span>
            <strong>11:00 PM</strong>
          </div>
        </div>

        <div className="ornament-small">✦</div>
      </section>

      <section className="welcome-section">
        <p className="section-label">AWAITING TO WELCOME</p>

        <h2>OUR BELOVED FAMILY & FRIENDS</h2>

        <p>
          Your presence, prayers and blessings
          <br />
          will make our celebration even more special.
        </p>

        <h3>Awaiting to Welcome</h3>

        <h2>Mr & Mrs Advocate Ashraf Ali</h2>
      </section>

      <section className="rsvp-section">
        <p className="section-label">RSVP</p>

        <p>FOR ANY ASSISTANCE</p>

        <h3>Advocate Ashraf Ali</h3>

        <a href="tel:+923342595325">
          03342595325
        </a>

        <div className="ornament">❦</div>
      </section>

      <section className="footer-section">
        <p>WITH LOVE & BLESSINGS</p>
      </section>

      {scratched && (
        <div className="calendar-box">
          <button onClick={addToCalendar}>
            ADD TO CALENDAR
          </button>

          <div className="gift-message">
            <strong>No Box Gifts Please</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default Baraat;
