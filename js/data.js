/* ==========================================================
   GET FADES — Business Data
   Lahat ng content na pwedeng palitan ay nandito lang.
   Walang rendering logic sa file na ito.
   ========================================================== */

(function () {
  "use strict";

  const BOOKING_FEE = 50;

  const GETFADES_DATA = {
    business: {
      name: "GET FADES",
      tagline: "Your cut. Your confidence.",
      subtagline: "More than a haircut. A style that feels like you.",
      logo: "", // ilagay dito ang path ng logo kapag meron na, e.g. "public/images/shop/logo.png"
      mapsUrl: "https://maps.app.goo.gl/tSoMAwWoEo4CYmX49?g_st=ic",
      phones: [
        { display: "0977 603 9106", tel: "+639776039106" },
        { display: "0927 410 3417", tel: "+639274103417" }
      ],
      social: {
        facebook: "https://www.facebook.com/share/1G1P8pDjtZ/?mibextid=wwXIfr",
        instagram: "https://www.instagram.com/get.fades?xtok=d3JtN2FmM2tkcGE0"
      }
    },

    // day: 0 = Sunday ... 6 = Saturday (para sa future "open now" logic)
    hours: [
      { day: 1, label: "Monday",    open: "8:00 AM",  close: "9:00 PM" },
      { day: 2, label: "Tuesday",   open: "8:00 AM",  close: "9:00 PM" },
      { day: 3, label: "Wednesday", open: "8:00 AM",  close: "9:00 PM" },
      { day: 4, label: "Thursday",  open: "8:00 AM",  close: "9:00 PM" },
      { day: 5, label: "Friday",    open: "10:00 AM", close: "9:00 PM" },
      { day: 6, label: "Saturday",  open: "8:00 AM",  close: "9:00 PM" },
      { day: 0, label: "Sunday",    open: "8:00 AM",  close: "9:00 PM" }
    ],
    hoursNote: "Please check our official Facebook page for schedule changes and announcements.",

    booking: {
      fee: BOOKING_FEE,
      walkInsWelcome: true,
      method: "Message our Facebook page to book an appointment.",
      note:
        "Appointments require an additional ₱" + BOOKING_FEE +
        " booking fee. Message our Facebook page to book. Walk-ins are welcome."
    },

    services: {
      main: [
        {
          id: "mens-haircut",
          name: "Men's Haircut",
          price: 200,
          description: "A clean, tailored cut after a quick consultation."
        },
        {
          id: "premium-haircut",
          name: "Premium Haircut",
          price: 250,
          description: "Our premium cut, done with extra attention to detail."
        }
      ],
      other: [
        {
          id: "mustache",
          name: "Mustache Trim / Shave",
          price: 50,
          description: "Neat and precise mustache grooming."
        },
        {
          id: "beard-fade",
          name: "Beard Fade / Shave",
          price: 50,
          description: "A sharp beard fade or clean shave."
        }
      ]
    },

    brand: {
      introHeading: "Built on more than the cut.",
      storyHeading: "More than a haircut.",
      story:
        "Every great haircut starts with a conversation. At GET FADES, we take the time to understand your style, your preferences, and the look that gives you confidence. Our goal isn't just to give you a fresh cut. It's to build a relationship that keeps you looking and feeling your best."
    },

    // Barbers. Pag may specialty o bio na, idagdag lang ang:
    //   specialty: "Skin fade", bio: "Short bio here"
    barbers: [
      {
        name: "Jegs",
        specialty: "Owner",
        photo: "public/images/barbers/barberjegs-owner.png"
      },
      {
        name: "Carl",
        photo: "public/images/barbers/barbercarl.png"
      },
      {
        name: "Jhay",
        photo: "public/images/barbers/barberjhay.png"
      },
      {
        name: "JR",
        photo: "public/images/barbers/barberjr.png"
      }
    ],

    // Walang gallery pa. Pag meron na, idagdag ganito:
    // { type: "image", src: "public/images/gallery/low-taper-fade-01.jpg", alt: "Low taper fade", width: 800, height: 1000 }
    // { type: "video", src: "public/videos/shop-showcase.mp4", poster: "public/images/gallery/poster.jpg", alt: "Shop showcase" }
    gallery: [],

    // Stories (Gallery): isang bilog bawat gupit. Dito pumipili ang customer.
    // Para magdagdag: kopyahin ang isang { name, photos } at palitan.
    // Optional: cover: "path" kung gusto ibang photo sa bilog (default ay una sa photos).
    stories: [
      {
        name: "Mid Fade",
        photos: [
          "public/images/gallery/midfade.png",
          "public/images/gallery/midfade1.png"
        ]
      },
      {
        name: "Mullet",
        photos: [
          "public/images/gallery/mullets1.png",
          "public/images/gallery/mullets2.png",
          "public/images/gallery/mullets3.png",
          "public/images/gallery/mullets4.png"
        ]
      },
      {
        name: "Taper",
        photos: [
          "public/images/gallery/taper.png",
          "public/images/gallery/taper2.png",
          "public/images/gallery/taper3.png",
          "public/images/gallery/taper4.png",
          "public/images/gallery/taper5.png",
          "public/images/gallery/taper6.png",
          "public/images/gallery/taper7.png"
        ]
      }
    ],

    // Franchise: open: false = "Coming soon". Pag ready na, gawing open: true
    // at ayusin ang text sa "opened" (at url kung may inquiry link/form; kung wala, Facebook ang gamit).
    franchise: {
      open: false,
      comingSoon: {
        title: "Coming soon.",
        text: "Franchise opportunities will be announced soon. Stay tuned.",
        button: "" // walang button hangga't hindi pa bukas
      },
      opened: {
        title: "Own a GET FADES.",
        text: "We are now accepting franchise inquiries. Message us to get the details.",
        button: "Inquire about franchising",
        url: ""
      }
    },

    amenities: [
      { id: "aircon", label: "Air-conditioned shop", icon: "snowflake" },
      { id: "wifi",   label: "Wi-Fi",                icon: "wifi" },
      { id: "tv",     label: "Smart TV",             icon: "tv" }
    ],

    reviews: {
      source: "Google Maps",
      rating: 4.6,
      count: 6,
      url: "https://maps.app.goo.gl/tSoMAwWoEo4CYmX49?g_st=ic",
      verifyBeforePublish: true // i-check muna sa Google Maps kung current pa bago i-launch
    },

    marquee: ["Fresh cuts", "Sharp details", "Real confidence", "GET FADES"]
  };

  // Helper: presyo ng service kasama ang appointment fee
  GETFADES_DATA.priceWithBooking = function (price) {
    return price + BOOKING_FEE;
  };

  // Helper: format ng peso
  GETFADES_DATA.formatPeso = function (amount) {
    return "₱" + Number(amount).toLocaleString("en-PH");
  };

  window.GETFADES_DATA = Object.freeze(GETFADES_DATA);
})();