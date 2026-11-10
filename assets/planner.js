(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";

  const PALETTES = {
    berry:    { name: "Berry",     bed: "#F6A9C9", accent: "#E0307A", deep: "#7B2FD0", light: "#FDE4EF" },
    sea:      { name: "Sea glass", bed: "#9FDCD1", accent: "#159A88", deep: "#1F5670", light: "#E2F6F2" },
    citrus:   { name: "Citrus",    bed: "#FFD27D", accent: "#F0801C", deep: "#B83A12", light: "#FFF1D6" },
    midnight: { name: "Midnight",  bed: "#AFB8F6", accent: "#4B3BFF", deep: "#1E2A78", light: "#E7EAFE" },
    sage:     { name: "Sage",      bed: "#C7DAB6", accent: "#5F9150", deep: "#34522D", light: "#EEF5E8" }
  };
  const PACKAGES = {
    essentials: { name: "Essentials", price: 450,  level: 1 },
    basic:      { name: "Basic",      price: 850,  level: 2 },
    deluxe:     { name: "Deluxe",     price: 1500, level: 3 }
  };
  const MAJORS = {
    none:  { name: "No add-on",   item: "",                               price: 0 },
    art:   { name: "Art",         item: "Easel & supply cart",            price: 75 },
    eng:   { name: "Engineering", item: "Dual-monitor arm & desk mat",    price: 75 },
    music: { name: "Music",       item: "Keyboard stand & headphone hook", price: 75 }
  };
  // share: "room" items are one per bedroom and "bath" items one per bathroom when everyone there orders;
  // value is the yearly cost that gets split.
  const ITEMS = [
    { lvl: 1, name: "Twin XL cotton sheets, 2 sets", keep: true, plan: true },
    { lvl: 1, name: "Comforter & 2 pillows", plan: true },
    { lvl: 1, name: "Mattress topper", plan: true },
    { lvl: 1, name: "Cotton towels", keep: true },
    { lvl: 1, name: "Shower caddy", keep: true },
    { lvl: 1, name: "Laundry hamper" },
    { lvl: 1, name: "Hangers & trash can" },
    { lvl: 1, name: "Surge protector" },
    { lvl: 1, name: "Under-bed storage boxes", plan: true, noDrawers: true },
    { lvl: 1, name: "Bathroom set: shower curtain, bath mat, cleaning caddy", share: "bath", value: 60 },
    { lvl: 1, name: "Welcome kit" },
    { lvl: 2, name: "Blackout blinds", plan: true },
    { lvl: 2, name: "Desk lamp with wireless charging", plan: true },
    { lvl: 2, name: "Bed fan & shoe rack" },
    { lvl: 2, name: "Full-length mirror" },
    { lvl: 2, name: "Whiteboard & calendar", keep: true },
    { lvl: 2, name: "3 posters, 11″ × 17″", keep: true, plan: true, max: 2 },
    { lvl: 3, name: "5 posters, 11″ × 17″", keep: true, plan: true },
    { lvl: 3, name: "Neon light strip", plan: true },
    { lvl: 3, name: "Peel-and-stick wallpaper wall", plan: true },
    { lvl: 3, name: "Chair upgrade", plan: true },
    { lvl: 3, name: "Beanbag", plan: true },
    { lvl: 3, name: "Throw, accent pillows & desk mat", plan: true },
    { lvl: 3, name: "Area rug", plan: true, share: "room", value: 90 },
    { lvl: 3, name: "Mini-fridge", plan: true, share: "room", value: 150 }
  ];
  // How many people split a shared item for this bed: roommates for a bedroom item, suitemates per bathroom.
  function shareCount(L, bed, share) {
    if (share === "room") return L.bedRoom.filter(r => r === L.bedRoom[bed]).length;
    const baths = Math.max(1, L.labels.filter(l => /^bath/i.test(l[2] || "")).length);
    return Math.max(1, Math.round(L.residents / baths));
  }
  // What one student saves a year when everyone sharing with them orders the same package.
  function shareSavings(L, bed, level) {
    return ITEMS.filter(it => it.share && it.lvl <= level)
      .reduce((sum, it) => sum + Math.round(it.value * (1 - 1 / shareCount(L, bed, it.share))), 0);
  }


  /* Floor plans traced from UMBC Residential Life's published drawings.
     Coordinates are pixels on a 4x render of each drawing (one unit on the plan = 2 px).
     Rects are [x0, y0, x1, y1]. Beds: head = pillow end; art = the wall run for posters,
     [x1, y1, x2, y2, nx, ny] with (nx, ny) pointing into the room. Doors: gap = the opening
     in the wall, leaf = hinge -> leaf end, arc = draw the swing. Rooms list the open floor
     spots for a rug, mini-fridge, beanbag and major add-on, one entry per bedroom, then
     shared rooms. */
  const RAW_LAYOUTS = {
    susq: {
      real: { w: 282, h: 220, src: "measured in UMBC's 360° tour" }, bedIn: [40, 84], deskIn: [42, 24], hutch: true, taskChair: true,
      floorBase: "carpetGray", floors: [{ type: "tile", poly: [[424, 17], [625, 17], [625, 303], [424, 303]] }],
      bedRoom: [0, 0, 1, 1], bedNames: ["A1", "A2", "B1", "B2"],
      name: "Susquehanna · Patapsco · Chesapeake", short: "Susquehanna / Patapsco / Chesapeake", group: "Residence halls",
      type: "Double rooms · shared bath", desc: "Two double rooms sharing a bathroom", residents: 4,
      outline: [[15.5, 17], [1032.5, 17], [1032.5, 734], [15.5, 734]],
      walls: [[424, 17, 424, 114], [424, 211, 424, 303], [625, 17, 625, 114], [625, 211, 625, 303], [424, 303, 625, 303], [524.5, 303, 524.5, 734, 1.5]],
      windows: [[182, 17, 347, 17], [699, 17, 864, 17]],
      doors: [{ gap: [180, 734, 312, 734], leaf: [311, 734, 207, 667] }, { gap: [734, 734, 865, 734], leaf: [735, 734, 829, 666] },
              { leaf: [424, 114, 373, 180] }, { leaf: [625, 114, 680, 178] }],
      furn: [["shower", 474.5, 27, 576.5, 113.5], ["toilet", 524, 239, 21, 28, [484, 268, 566, 299]],
             ["sink", 467.5, 303, 524.5, 394.5], ["sink", 524.5, 303, 581.5, 394.5],
             ["wardrobe", 440, 422, 524.5, 577.5], ["wardrobe", 524.5, 422, 608.5, 577.5], ["wardrobe", 440, 577.5, 524.5, 734], ["wardrobe", 524.5, 577.5, 608.5, 734]],
      beds: [{ r: [15.5, 62.5, 300.5, 185.5], head: "l", art: [22, 17, 176, 17, 0, 1] },
             { r: [15.5, 462.5, 145.5, 734], head: "b", art: [15.5, 470, 15.5, 728, 1, 0] },
             { r: [748.5, 62.5, 1032.5, 185.5], head: "r", art: [870, 17, 1026, 17, 0, 1] },
             { r: [903.5, 462.5, 1032.5, 734], head: "b", art: [1032.5, 470, 1032.5, 728, -1, 0] }],
      desks: [{ r: [15.5, 185.5, 83.5, 324], wall: "l" }, { r: [15.5, 324, 83.5, 462.5], wall: "l" },
              { r: [965, 185.5, 1032.5, 324], wall: "r" }, { r: [965, 324, 1032.5, 462.5], wall: "r" }],
      rooms: [{ rug: [150, 300, 390, 560], fridge: [418, 450], bean: [365, 70], extra: [250, 235] },
              { rug: [658, 300, 898, 560], fridge: [630, 450], bean: [684, 70], extra: [798, 235] }],
      labels: [[250, 640, "Room A"], [800, 640, "Room B"], [524, 160, "Bath"]]
    },
    potomac: {
      real: { w: 306, h: 221, src: "scaled from its extra-long twin beds" }, bedIn: [40, 84], deskIn: [42, 24], hutch: true, taskChair: true,
      floorBase: "carpetGray", floors: [{ type: "tile", poly: [[399, 465], [741, 465], [741, 560], [680.5, 661], [680.5, 760.5], [460.5, 760.5], [460.5, 661], [399, 560]] }],
      bedRoom: [0, 0, 1, 1], bedNames: ["A1", "A2", "B1", "B2"],
      name: "Potomac Hall", short: "Potomac Hall", group: "Residence halls",
      type: "Double rooms · shared bath", desc: "Two double rooms sharing a bathroom", residents: 4,
      outline: [[18, 17.5], [1123, 17.5], [1123, 760.5], [18, 760.5]],
      walls: [[571, 17.5, 571, 465, 1.5], [399, 465, 741, 465], [399, 465, 399, 560], [741, 465, 741, 560],
              [460.5, 661, 460.5, 760.5], [680.5, 661, 680.5, 760.5]],
      windows: [[199, 17.5, 378, 17.5], [761, 17.5, 940, 17.5]],
      doors: [{ gap: [202, 760.5, 340, 760.5], leaf: [202, 760.5, 300, 690] }, { gap: [799, 760.5, 941, 760.5], leaf: [940, 760.5, 828, 690] },
              { leaf: [460.5, 661, 400, 594] }, { leaf: [680.5, 661, 741, 594] }],
      furn: [["sink", 399, 465, 461, 560], ["sink", 680, 465, 741, 560], ["toilet", 570, 530, 21, 29, [524, 468, 614, 500]],
             ["shower", 515, 662, 627, 752],
             ["wardrobe", 18, 439, 108, 600.5], ["wardrobe", 18, 600.5, 108, 760.5], ["wardrobe", 1033, 439, 1123, 600.5], ["wardrobe", 1033, 600.5, 1123, 760.5]],
      beds: [{ r: [18, 17.5, 159, 296], head: "t", art: [18, 25, 18, 290, 1, 0] },
             { r: [428.5, 17.5, 571, 296], head: "t", art: [433, 17.5, 566, 17.5, 0, 1] },
             { r: [571, 17.5, 713.5, 296], head: "t", art: [576, 17.5, 708, 17.5, 0, 1] },
             { r: [982.5, 17.5, 1123, 296], head: "t", art: [1123, 25, 1123, 290, -1, 0] }],
      desks: [{ r: [18, 296, 92, 439], wall: "l" }, { r: [495.5, 296, 571, 439], wall: "r" },
              { r: [571, 296, 646.5, 439], wall: "l" }, { r: [1047.5, 296, 1123, 439], wall: "r" }],
      rooms: [{ rug: [175, 310, 385, 560], fridge: [472, 320], bean: [205, 80], extra: [360, 75] },
              { rug: [756, 310, 966, 560], fridge: [669, 320], bean: [936, 80], extra: [781, 75] }],
      labels: [[290, 640, "Room A"], [852, 640, "Room B"], [570, 612, "Bath"]]
    },
    triple: {
      real: { w: 308, h: 256, src: "measured in UMBC's 360° tour (furniture placement approximate)" }, bedIn: [40, 84], deskIn: [42, 24], hutch: true, taskChair: true,
      floorBase: "carpetGray", floors: [{ type: "tile", poly: [[302.6,  547.4],  [731.0,  547.4],  [731.0,  870.4],  [302.6,  870.4]] }],
      bedRoom: [0, 0, 0, 1], bedNames: ["T1", "T2", "T3", "S"], roomNames: ["Triple", "Single"],
      name: "Residence hall triple + single", short: "Residence hall triple + single", group: "Residence halls",
      type: "Triple bedroom + single · shared bath", desc: "A triple bedroom and a single bedroom sharing a bathroom", residents: 4,
      outline: [[0.0,  0.0],  [666.4,  0.0],  [666.4,  88.4],  [1047.2,  88.4],  [1047.2,  870.4],  [25.5,  870.4],  [25.5,  547.4],  [0.0,  547.4]],
      walls: [[666.4,  88.4,  666.4,  547.4],  [302.6,  547.4,  731.0,  547.4],  [302.6,  547.4,  302.6,  666.4],  [302.6,  788.8,  302.6,  870.4],  [731.0,  547.4,  731.0,  666.4],  [731.0,  788.8,  731.0,  870.4]],
      windows: [[0.0,  20.4,  0.0,  136.0],  [353.6,  0.0,  612.0,  0.0],  [25.5,  612.0,  25.5,  850.0],  [1047.2,  612.0,  1047.2,  816.0]],
      doors: [{ gap: [170.0,  870.4,  292.4,  870.4], leaf: [292.4,  870.4,  292.4,  748.0], arc: true }, { gap: [850.0,  870.4,  972.4,  870.4], leaf: [972.4,  870.4,  972.4,  748.0], arc: true }, { gap: [302.6,  666.4,  302.6,  788.8], leaf: [302.6,  788.8,  425.0,  788.8], arc: true }, { gap: [731.0,  666.4,  731.0,  788.8], leaf: [731.0,  788.8,  608.6,  788.8], arc: true }],
      furn: [["shower",  598.4,  547.4,  724.2,  669.8], ["toilet",  380.8,  618.8,  27.2,  40.8,  [353.6,  554.2,  408.0,  581.4]], ["sink",  221.0,  571.2,  302.6,  768.4], ["sink",  731.0,  571.2,  812.6,  768.4], ["wardrobe",  0.0,  166.6,  81.6,  329.8], ["wardrobe",  0.0,  329.8,  81.6,  493.0], ["wardrobe",  170.0,  0.0,  333.2,  81.6], ["wardrobe",  965.6,  408.0,  1047.2,  571.2]],
      beds: [{ r: [340.0,  0.0,  625.6,  136.0], head: "r", art: [353.6,  0.0,  612.0,  0.0,  0,  1] }, { r: [380.8,  404.6,  666.4,  540.6], head: "r", art: [387.6,  547.4,  659.6,  547.4,  0,  -1] }, { r: [27.2,  584.8,  163.2,  870.4], head: "b", art: [25.5,  598.4,  25.5,  856.8,  1,  0] }, { r: [754.8,  88.4,  1040.4,  224.4], head: "r", art: [768.4,  88.4,  1026.8,  88.4,  0,  1] }],
      desks: [{ r: [0.0,  23.8,  81.6,  166.6], wall: "l", ped: "start" }, { r: [584.8,  149.6,  666.4,  292.4], wall: "r" }, { r: [231.2,  465.8,  374.0,  547.4], wall: "b" }, { r: [666.4,  326.4,  748.0,  469.2], wall: "l" }],
      rooms: [{ rug: [102.0,  163.2,  510.0,  374.0], fridge: [187.0,  510.0], bean: [510.0,  323.0], extra: [136.0,  476.0] }, { rug: [768.4,  510.0,  986.0,  782.0], fridge: [999.6,  306.0], bean: [850.0,  680.0], extra: [884.0,  408.0] }],
      labels: [[340.0,  272.0,  "Triple"],  [867.0,  340.0,  "Single"],  [510.0,  765.0,  "Bath"]]
    },
    erickson: {
      real: { w: 386, h: 245, src: "measured in UMBC's 360° tour" }, bedIn: [40, 84], deskIn: [42, 24], taskChair: true, upholstery: "#55657A",
      floorBase: "wood", floors: [{ type: "tile", poly: [[277, 548], [501, 548], [501, 720], [277, 720]] }],
      bedRoom: [0, 0, 1, 1], bedNames: ["A1", "A2", "B1", "B2"],
      name: "Erickson & Harbor Halls", short: "Erickson / Harbor double suite", group: "Residence halls",
      type: "Double suite · common room", desc: "Two double rooms, a common room and a bathroom", residents: 4,
      outline: [[12.5, 17], [1038.5, 17], [1038.5, 720], [12.5, 720]],
      walls: [[354, 17, 354, 419], [696, 17, 696, 419], [12.5, 548, 120, 548], [230, 548, 397, 548], [482, 548, 501, 548],
              [277, 548, 277, 720], [501, 548, 501, 720], [672, 548, 773, 548], [772, 548, 772, 720], [927, 548, 1038.5, 548]],
      windows: [[97, 17, 267, 17], [371, 17, 681, 17], [785, 17, 954, 17]],
      doors: [{ leaf: [354, 548, 292, 455] }, { leaf: [697, 548, 755, 453] },
              { gap: [397, 548, 482, 548], leaf: [481, 548, 425, 600] },
              { gap: [523, 720, 630, 720], leaf: [523, 720, 600, 650] }],
      furn: [["couch", 364.5, 28.5, 590.5, 112.5], ["end", 599.5, 38, 671.5, 112.5], ["coffee", 400, 140.5, 539, 199.5], ["chair", 612, 160, 688, 262],
             ["closet", 12.5, 548, 68.5, 718], ["closet", 68.5, 656, 230, 718], ["closet", 981.5, 548, 1038.5, 718], ["closet", 820.5, 654, 981.5, 718],
             ["sink", 230, 548, 277, 638], ["cabinet", 230, 638, 277, 718], ["shower", 285, 562, 361, 655],
             ["toilet", 440, 620, 17, 29, [407, 677, 475, 708]], ["sink", 772, 548, 820.5, 640], ["cabinet", 772, 640, 820.5, 718]],
      beds: [{ r: [12.5, 28.5, 249, 149], head: "l", art: [12.5, 34, 12.5, 143, 1, 0] },
             { r: [12.5, 285, 120, 548], head: "b", art: [12.5, 292, 12.5, 540, 1, 0] },
             { r: [802.5, 28.5, 1038.5, 149], head: "r", art: [1038.5, 34, 1038.5, 143, -1, 0] },
             { r: [928, 285, 1038.5, 548], head: "b", art: [1038.5, 292, 1038.5, 540, -1, 0] }],
      desks: [{ r: [12.5, 149, 69.5, 285], wall: "l" }, { r: [296.5, 238.5, 354, 371.5], wall: "r" },
              { r: [981.5, 149, 1038.5, 283], wall: "r" }, { r: [696, 238.5, 753.5, 371.5], wall: "l" }],
      rooms: [{ rug: [125, 165, 285, 410], fridge: [332, 400], bean: [300, 80], extra: [180, 480] },
              { rug: [766, 165, 926, 410], fridge: [719, 400], bean: [751, 80], extra: [871, 480] },
              { rug: [375, 125, 595, 235] }],
      labels: [[198, 255, "Room A"], [835, 255, "Room B"], [525, 330, "Common"], [389, 692, "Bath"]]
    },
    harbor: {
      real: { w: 401, h: 240, src: "measured in UMBC's 360° tour" }, bedIn: [40, 84], deskIn: [42, 24], taskChair: true, upholstery: "#55657A",
      floorBase: "wood", floors: [{ type: "tile", poly: [[437.5, 566], [699.5, 566], [699.5, 714], [437.5, 714]] }],
      bedRoom: [0, 1, 2, 3], bedNames: ["A", "B", "C", "D"],
      name: "Harbor Hall", short: "Harbor Hall single suite", group: "Residence halls",
      type: "Single suite · 4 bedrooms", desc: "Four single bedrooms around a shared bath and lounge", residents: 4,
      outline: [[12, 16], [1129.5, 16], [1129.5, 714], [12, 714]],
      walls: [[291, 16, 291, 461], [570.5, 16, 570.5, 461], [849.5, 16, 849.5, 461],
              [12, 461, 162, 461], [281, 461, 299, 461], [418, 461, 720, 461], [840, 461, 860, 461], [980, 461, 1129.5, 461],
              [437.5, 566, 437.5, 714], [699.5, 566, 699.5, 714], [600.5, 581, 600.5, 671], [437.5, 670, 699.5, 670]],
      windows: [[52, 16, 238, 16], [348, 16, 533, 16], [615, 16, 799, 16], [896, 16, 1081, 16]],
      doors: [{ leaf: [283, 461, 185, 394] }, { leaf: [297, 461, 385, 394] }, { leaf: [842, 461, 745, 394] }, { leaf: [858, 461, 945, 393] },
              { leaf: [437.5, 463, 490, 537] }, { leaf: [704, 463, 655, 537] },
              { gap: [217, 714, 337, 714], leaf: [337, 714, 240, 647] }, { gap: [802, 714, 912, 714], leaf: [802, 714, 882, 650] }],
      furn: [["closet", 12, 409, 146.5, 461], ["closet", 437.5, 409, 570.5, 461], ["closet", 570.5, 409, 704, 461], ["closet", 997, 409, 1129.5, 461],
             ["loveseat", 19.5, 466.5, 103.5, 632], ["end", 28.5, 637, 91, 710],
             ["chair", 1022, 467, 1116, 552], ["round", 1075, 586.5, 23.5], ["chair", 1022, 619, 1116, 705],
             ["tub", 445, 581, 588, 665], ["toilet", 651, 605, 19, 28, [614, 635, 688, 663]],
             ["sink", 348, 662, 437.5, 712], ["sink", 700, 661, 792, 712]],
      beds: [{ r: [12, 16, 129.5, 278.5], head: "t", art: [12, 24, 12, 270, 1, 0] },
             { r: [452, 16, 570.5, 278.5], head: "t", art: [570.5, 24, 570.5, 270, -1, 0] },
             { r: [570.5, 16, 688, 278.5], head: "t", art: [570.5, 24, 570.5, 270, 1, 0] },
             { r: [1011.5, 16, 1129.5, 278.5], head: "t", art: [1129.5, 24, 1129.5, 270, -1, 0] }],
      desks: [{ r: [158, 16, 291, 79], wall: "t" }, { r: [291, 16, 424, 79], wall: "t" },
              { r: [716.5, 16, 849.5, 79], wall: "t" }, { r: [849.5, 16, 983.5, 79], wall: "t" }],
      rooms: [{ rug: [145, 110, 240, 330], fridge: [269, 105], bean: [165, 345], extra: [255, 355] },
              { rug: [342, 110, 437, 330], fridge: [313, 105], bean: [417, 345], extra: [327, 355] },
              { rug: [704, 110, 799, 330], fridge: [828, 105], bean: [724, 345], extra: [814, 355] },
              { rug: [901.5, 110, 996.5, 330], fridge: [872.5, 105], bean: [976.5, 345], extra: [886.5, 355] },
              { rug: [115, 480, 330, 630] }],
      labels: [[195, 260, "A"], [370, 260, "B"], [765, 260, "C"], [945, 260, "D"], [520, 692, "Bath"], [200, 560, "Lounge"]]
    },
    harbormix: {
      real: { w: 401, h: 240, src: "the Harbor single-suite shell; UMBC hasn't published this plan" }, bedIn: [40, 84], deskIn: [42, 24], taskChair: true, upholstery: "#55657A",
      floorBase: "wood", floors: [{ type: "tile", poly: [[437.5, 566], [699.5, 566], [699.5, 714], [437.5, 714]] }],
      bedRoom: [0, 0, 1, 2], bedNames: ["A1", "A2", "C", "D"], roomNames: ["Double", "Bedroom C", "Bedroom D"],
      name: "Harbor Hall", short: "Harbor Hall two singles + double", group: "Residence halls",
      type: "Suite · one double, two singles · approximate", desc: "One double and two single bedrooms around a shared bath and lounge", residents: 4,
      outline: [[12, 16], [1129.5, 16], [1129.5, 714], [12, 714]],
      walls: [[570.5, 16, 570.5, 461], [849.5, 16, 849.5, 461],
              [12, 461, 162, 461], [281, 461, 720, 461], [840, 461, 860, 461], [980, 461, 1129.5, 461],
              [437.5, 566, 437.5, 714], [699.5, 566, 699.5, 714], [600.5, 581, 600.5, 671], [437.5, 670, 699.5, 670]],
      windows: [[52, 16, 238, 16], [348, 16, 533, 16], [615, 16, 799, 16], [896, 16, 1081, 16]],
      doors: [{ leaf: [283, 461, 185, 394] }, { leaf: [842, 461, 745, 394] }, { leaf: [858, 461, 945, 393] },
              { leaf: [437.5, 463, 490, 537] }, { leaf: [704, 463, 655, 537] },
              { gap: [217, 714, 337, 714], leaf: [337, 714, 240, 647] }, { gap: [802, 714, 912, 714], leaf: [802, 714, 882, 650] }],
      furn: [["closet", 12, 409, 146.5, 461], ["closet", 437.5, 409, 570.5, 461], ["closet", 570.5, 409, 704, 461], ["closet", 997, 409, 1129.5, 461],
             ["loveseat", 19.5, 466.5, 103.5, 632], ["end", 28.5, 637, 91, 710],
             ["chair", 1022, 467, 1116, 552], ["round", 1075, 586.5, 23.5], ["chair", 1022, 619, 1116, 705],
             ["tub", 445, 581, 588, 665], ["toilet", 651, 605, 19, 28, [614, 635, 688, 663]],
             ["sink", 348, 662, 437.5, 712], ["sink", 700, 661, 792, 712]],
      beds: [{ r: [12, 16, 129.5, 278.5], head: "t", art: [12, 24, 12, 270, 1, 0] },
             { r: [452, 16, 570.5, 278.5], head: "t", art: [570.5, 24, 570.5, 270, -1, 0] },
             { r: [570.5, 16, 688, 278.5], head: "t", art: [570.5, 24, 570.5, 270, 1, 0] },
             { r: [1011.5, 16, 1129.5, 278.5], head: "t", art: [1129.5, 24, 1129.5, 270, -1, 0] }],
      desks: [{ r: [158, 16, 291, 79], wall: "t" }, { r: [291, 16, 424, 79], wall: "t" },
              { r: [716.5, 16, 849.5, 79], wall: "t" }, { r: [849.5, 16, 983.5, 79], wall: "t" }],
      rooms: [{ rug: [190, 110, 410, 330], fridge: [300, 105], bean: [200, 345], extra: [380, 355] },
              { rug: [704, 110, 799, 330], fridge: [828, 105], bean: [724, 345], extra: [814, 355] },
              { rug: [901.5, 110, 996.5, 330], fridge: [872.5, 105], bean: [976.5, 345], extra: [886.5, 355] },
              { rug: [115, 480, 330, 630] }],
      labels: [[290, 260, "Double"], [765, 260, "C"], [945, 260, "D"], [520, 692, "Bath"], [200, 560, "Lounge"]]
    },
    terrace: {
      real: { w: 394, h: 329, src: "measured in UMBC's 360° tour" }, bedIn: [40, 84], deskIn: [42, 24], upholstery: "#2F3B5C",
      floorBase: "carpetBrown", floors: [{ type: "tile", poly: [[333, 12], [604.5, 12], [604.5, 140], [333, 140]] }, { type: "tile", poly: [[548, 275], [740.5, 275], [740.5, 404], [548, 404]] }, { type: "vinyl", poly: [[604.5, 12], [988.5, 12], [988.5, 280], [604.5, 280]] }],
      bedRoom: [0, 1, 2, 3], bedNames: ["1", "2", "3", "4"],
      name: "Terrace & Hillside Apartments", short: "Terrace / Hillside apartment", group: "Apartments",
      type: "Apartment · 4 single bedrooms", desc: "Four single bedrooms, a kitchen and a shared bath", residents: 4,
      outline: [[17.5, 12], [988.5, 12], [988.5, 525], [927.5, 525], [927.5, 668], [740.5, 668], [740.5, 821], [195.5, 821], [195.5, 527], [17.5, 527]],
      walls: [[17.5, 270, 332, 270], [329.5, 12, 329.5, 148], [329.5, 262, 329.5, 406], [329.5, 520, 329.5, 527],
              [195.5, 527, 341, 527], [461, 526, 475, 526], [467.5, 526, 467.5, 821], [595, 526, 740.5, 526], [740.5, 526, 740.5, 668],
              [604.5, 12, 604.5, 275], [548, 275, 740.5, 275], [740.5, 275, 740.5, 404], [548, 404, 740.5, 404]],
      windows: [[17.5, 73, 17.5, 206], [17.5, 331, 17.5, 464], [261, 821, 402, 821], [533, 821, 674, 821], [870, 668, 925, 668]],
      doors: [{ leaf: [330, 269, 262, 180] }, { leaf: [330, 523, 262, 440] },
              { gap: [341, 526, 461, 526], leaf: [464, 526, 375, 589] }, { gap: [475, 526, 595, 526], leaf: [471, 526, 573, 588] },
              { leaf: [549, 402, 612, 312] }, { leaf: [604, 524, 540, 440] }, { gap: [742, 668, 869, 668], leaf: [742, 668, 845, 727] }],
      furn: [["closet", 278, 12, 327, 137], ["closet", 278, 270, 327, 395.5], ["closet", 195.5, 527, 329.5, 574.5], ["closet", 607.5, 527, 740.5, 574.5],
             ["tub", 333, 14, 566, 98], ["sink", 555, 110, 604.5, 193], ["sink", 555, 193, 604.5, 275],
             ["toilet", 675, 340, 27, 21, [704, 302, 732, 375]],
             ["appl", 606, 14, 711, 58, 0, "Fridge"], ["counter", 606, 58, 659, 272], ["ksink", 612, 68, 653, 125],
             ["table", 842, 61, 977, 122], ["chair", 850, 25, 895, 49], ["chair", 920, 25, 965, 49],
             ["chair", 853, 133, 898, 157], ["chair", 922, 134, 967, 158],
             ["chair", 832, 198, 908, 274], ["chair", 920, 215, 977, 272], ["loveseat", 907, 281, 988, 432], ["chair", 842, 438, 918, 515]],
      beds: [{ r: [17.5, 12, 136.5, 256.5], head: "t", art: [22, 12, 132, 12, 0, 1] },
             { r: [17.5, 270, 136.5, 514.5], head: "t", art: [22, 270, 132, 270, 0, 1] },
             { r: [195.5, 708.5, 455.5, 821], head: "l", art: [195.5, 712, 195.5, 816, 1, 0] },
             { r: [479.5, 708.5, 740.5, 821], head: "r", art: [740.5, 712, 740.5, 816, -1, 0] }],
      desks: [{ r: [139.5, 12, 271.5, 70.5], wall: "t" }, { r: [139.5, 270, 271.5, 329.5], wall: "t" },
              { r: [195.5, 581, 258.5, 705.5], wall: "l" }, { r: [677.5, 580, 740.5, 705], wall: "r" }],
      rooms: [{ rug: [150, 90, 255, 225], fridge: [305, 160], bean: [170, 232], extra: [225, 240] },
              { rug: [150, 348, 255, 483], fridge: [305, 418], bean: [170, 490], extra: [225, 498] },
              { rug: [305, 592, 455, 700], fridge: [280, 600], bean: [420, 675], extra: [440, 622] },
              { rug: [485, 592, 630, 700], fridge: [655, 600], bean: [510, 675], extra: [500, 622] },
              { rug: [750, 290, 900, 430] }],
      labels: [[215, 130, "1"], [215, 390, "2"], [380, 650, "3"], [560, 650, "4"], [445, 172, "Bath"], [790, 160, "Kitchen"]]
    },
    westhill: {
      real: { w: 461, h: 271, src: "measured in UMBC's 360° tour" }, bedIn: [40, 84], deskIn: [42, 24], upholstery: "#A88F68",
      floorBase: "carpetBrown", floors: [{ type: "tile", poly: [[529, 400], [775, 400], [775, 717], [529, 717]] }, { type: "vinyl", poly: [[775, 16], [1040, 16], [1040, 293], [775, 293]] }],
      bedRoom: [0, 1, 2, 3], bedNames: ["1", "2", "3", "4"],
      name: "West Hill Apartments", short: "West Hill apartment", group: "Apartments",
      type: "Apartment · 4 single bedrooms", desc: "Four single bedrooms, a kitchen and living room", residents: 4,
      outline: [[13, 16], [1040, 16], [1040, 293], [1101.5, 293], [1101.5, 717], [13, 717]],
      walls: [[371, 16, 371, 293], [418, 16, 418, 293], [775, 16, 775, 293],
              [13, 293, 245, 293], [358, 293, 430, 293], [542, 293, 775, 293],
              [13, 400, 151, 400], [263, 400, 404, 400], [515, 400, 540, 400], [654, 400, 775, 400],
              [270.5, 400, 270.5, 717], [529, 400, 529, 717], [775, 400, 775, 717],
              [673, 500, 673, 613], [673, 613, 775, 613], [1040, 427, 1101.5, 427]],
      windows: [],
      doors: [{ gap: [245, 293, 358, 293], leaf: [360, 293, 268, 222] }, { gap: [430, 293, 542, 293], leaf: [430, 293, 509, 224] },
              { gap: [151, 400, 263, 400], leaf: [270, 401, 183, 469] }, { gap: [404, 400, 515, 400], leaf: [515, 401, 437, 468] },
              { leaf: [673, 401, 735, 481] }, { gap: [1101.5, 295, 1101.5, 427], leaf: [1101, 295, 1040, 393] }],
      furn: [["closet", 371, 16, 418, 155, 0, null, "l"], ["closet", 371, 155, 418, 286, 0, null, "r"], ["closet", 13, 295, 140.5, 347], ["closet", 13, 347, 140.5, 400],
             ["counter", 775.5, 16, 827, 293], ["counter", 986, 16, 1040, 293],
             ["sink", 529, 429, 575.5, 518.5], ["sink", 529, 518.5, 575.5, 608], ["shower", 588, 622, 722, 708],
             ["toilet", 720, 547, 15, 29, [690, 576, 760, 607]],
             ["chair", 800, 462, 880, 542, 45], ["table", 793, 590, 848, 665], ["coffee", 933, 518, 987, 672], ["couch", 1016, 442, 1093, 697]],
      beds: [{ r: [13, 16, 125.5, 293], head: "t", art: [13, 24, 13, 285, 1, 0] },
             { r: [662, 16, 775, 293], head: "t", art: [775, 24, 775, 285, -1, 0] },
             { r: [18.5, 589.5, 265, 714], head: "l", art: [13, 594, 13, 710, 1, 0] },
             { r: [276.5, 589.5, 523, 714], head: "r", art: [529, 594, 529, 710, -1, 0] }],
      desks: [{ r: [207.5, 16, 333.5, 83.5], wall: "t" }, { r: [465.5, 16, 592, 83], wall: "t" },
              { r: [18.5, 444, 77.5, 585], wall: "l" }, { r: [276.5, 444, 335.5, 585], wall: "l" }],
      rooms: [{ rug: [150, 100, 300, 215], fridge: [350, 110], bean: [165, 255], extra: [345, 180] },
              { rug: [470, 100, 640, 215], fridge: [440, 110], bean: [630, 255], extra: [445, 180] },
              { rug: [95, 470, 250, 575], fridge: [100, 422], bean: [240, 555], extra: [150, 430] },
              { rug: [350, 470, 505, 575], fridge: [360, 422], bean: [495, 555], extra: [400, 430] },
              { rug: [895, 480, 1005, 700] }],
      labels: [[165, 45, "1"], [627, 45, "2"], [200, 520, "3"], [460, 520, "4"], [905, 120, "Kitchen"], [624, 520, "Bath"], [900, 340, "Living"]]
    },
    walker: {
      real: { w: 674, h: 257, src: "from the room sizes printed on the floor plan" }, upholstery: "#6B6F7A", builtInClosets: true, underBedDrawers: true,
      bedRoom: [0, 1, 2, 3], bedNames: ["A", "B", "C", "D"],
      name: "Walker Avenue Apartments", short: "Walker Avenue apartment", group: "Apartments",
      type: "Apartment · 4 bedrooms · 2 baths", desc: "Four bedrooms, two baths, kitchen, laundry and living area", residents: 4,
      outline: [[132.5, 60], [1388.5, 60], [1388.5, 350], [1700, 350], [1700, 718], [132.5, 718], [132.5, 652], [100, 605], [57, 522], [132.5, 465]],
      // Tile runs from the front door through the kitchen, laundry, vanities and baths; the rest is carpet.
      floorBase: "carpet", floors: [{ type: "tile", poly: [[132.5, 465], [172.5, 525], [1395, 525], [1395, 718], [132.5, 718], [132.5, 652], [100, 605], [57, 522]] }],
      shell: [[103, 470], [103, 27.5], [1427, 27.5], [1427, 315], [1739.5, 315], [1739.5, 736], [103, 736], [103, 655]],
      walls: [[463.5, 60, 463.5, 440, 6], [775, 60, 775, 440, 10], [1084, 60, 1084, 440, 6], [1388.5, 350, 1388.5, 440],
              [1400, 350, 1400, 455], [1400, 540, 1400, 718],
              [470, 434, 662.5, 434], [750, 434, 800, 434], [887.5, 434, 1283, 434], [1370.5, 434, 1394, 434],
              [627.5, 355, 627.5, 434], [920.5, 355, 920.5, 434], [1248, 355, 1248, 434],
              [557, 612, 557, 718], [680, 535, 775, 535], [775, 535, 775, 718],
              [900, 540, 1280, 540], [900, 635, 900, 718], [1095, 540, 1095, 718], [1280, 635, 1280, 718]],
      windows: [[219, 60, 443, 60], [559.5, 60, 705.5, 60], [861, 60, 1006, 60], [1163, 60, 1305, 60], [1507, 350, 1652, 350]],
      doors: [{ gap: [57, 522, 100, 605], leaf: [100, 605, 183, 562], arc: true },
              { gap: [662.5, 434, 750, 434], leaf: [750, 434, 750, 349], arc: true },
              { gap: [800, 434, 887.5, 434], leaf: [800, 434, 800, 349], arc: true },
              { gap: [1283, 434, 1370.5, 434], leaf: [1370.5, 434, 1370.5, 349], arc: true },
              { gap: [1400, 455, 1400, 540], leaf: [1400, 540, 1485, 540], arc: true },
              { gap: [590, 535, 680, 535], leaf: [680, 535, 680, 625], arc: true },
              { gap: [900, 545, 900, 635], leaf: [900, 545, 990, 545], arc: true },
              { gap: [1280, 545, 1280, 635], leaf: [1280, 545, 1190, 545], arc: true }],
      furn: [["utility", 132.5, 60, 180, 147.5], ["endround", 195, 72.5, 252.5, 135], ["chair", 265, 69, 337.5, 146],
             ["sofa", 139, 155, 212.5, 361.5], ["coffee", 267.5, 211, 335, 308.5], ["tv", 396, 198.5, 455, 321],
             ["table", 257.5, 447.5, 362.5, 522.5], ["chair", 282.5, 412.5, 335, 447.5], ["chair", 282.5, 522.5, 335, 555],
             ["chair", 227.5, 457.5, 257.5, 512.5], ["chair", 362.5, 457.5, 395, 512.5],
             ["counter", 133, 652, 540, 715], ["range", 190, 655, 262, 715], ["ksink", 335, 655, 400, 715], ["appl", 400, 655, 465, 715, 0, "DW"],
             ["pantry", 548, 540, 585, 610], ["heater", 597, 672, 32], ["washer", 630, 645, 695, 715], ["dryer", 695, 645, 765, 715],
             ["sink", 790, 648, 895, 715], ["sink", 1285, 648, 1385, 715], ["tub", 1015, 545, 1090, 690], ["tub", 1105, 545, 1175, 690],
             ["toilet", 957, 670, 17, 24, [935, 698, 980, 716]], ["toilet", 1215, 670, 17, 24, [1193, 698, 1238, 716]],
             ["closet", 470, 355, 627.5, 434], ["closet", 920.5, 355, 1078, 434], ["closet", 1090.5, 355, 1248, 434],
             ["closet", 1400, 350, 1455, 445], ["closet", 1400, 557, 1470, 718]],
      beds: [{ r: [472.5, 62.5, 600, 262.5], head: "t", art: [470, 70, 470, 255, 1, 0] },
             { r: [948, 62.5, 1075.5, 262.5], head: "t", art: [1078, 70, 1078, 255, -1, 0] },
             { r: [1093, 62.5, 1220.5, 262.5], head: "t", art: [1090.5, 70, 1090.5, 255, 1, 0] },
             { r: [1571.5, 521.5, 1700, 718], head: "b", art: [1700, 530, 1700, 712, -1, 0] }],
      desks: [{ r: [712.5, 62.5, 765, 167.5], wall: "r" }, { r: [785, 62.5, 837.5, 167.5], wall: "l" },
              { r: [1333, 62.5, 1388.5, 167.5], wall: "r" }, { r: [1600, 350, 1700, 406.5], wall: "t" }],
      rooms: [{ rug: [490, 272, 700, 350], fridge: [622, 85], bean: [690, 310], extra: [650, 180] },
              { rug: [848, 272, 1058, 350], fridge: [926, 85], bean: [858, 310], extra: [898, 180] },
              { rug: [1110.5, 272, 1320.5, 350], fridge: [1242.5, 85], bean: [1310.5, 310], extra: [1270.5, 180] },
              { rug: [1480, 420, 1690, 505], fridge: [1578, 372], bean: [1520, 680], extra: [1520, 585] },
              { rug: [240, 175, 370, 345] }],
      labels: [[632, 300, "Bedroom A", "10'1\" × 12'0\""], [930, 300, "Bedroom B", "10'1\" × 12'0\""], [1270, 300, "Bedroom C", "10'2\" × 12'0\""],
               [1540, 460, "Bedroom D", "10'3\" × 12'3\""], [300, 395, "Living", "11'1\" × 15'5\""], [460, 600, "Kitchen", "14'2\" × 6'2\""],
               [725, 590, "Laundry"], [955, 590, "Bath"], [1235, 590, "Bath"]]
    }
  };

  // Convert traced pixels to plan units. The PDF drawings aren't to scale, so y is stretched to the
  // room size measured in UMBC's 360° tours (L.real, inches); x keeps 2 px per unit. L.U = units per inch.
  function prepLayout(raw) {
    const xs0 = raw.outline.map(p => p[0]), ys0 = raw.outline.map(p => p[1]);
    const pxW = Math.max.apply(null, xs0) - Math.min.apply(null, xs0), pxH = Math.max.apply(null, ys0) - Math.min.apply(null, ys0);
    const oy = Math.min.apply(null, ys0);
    const real = raw.real;
    const k = real ? (real.h / pxH) / (real.w / pxW) : 1;
    const sx = v => v / 2, sy = v => (oy + (v - oy) * k) / 2;
    const pt = p => [sx(p[0]), sy(p[1])];
    const seg = w => [sx(w[0]), sy(w[1]), sx(w[2]), sy(w[3])];
    const box = r => ({ x: sx(r[0]), y: sy(r[1]), w: sx(r[2]) - sx(r[0]), h: sy(r[3]) - sy(r[1]) });
    const L = Object.assign({}, raw);
    L.U = real ? (pxW / 2) / real.w : 1.5;
    L.outline = raw.outline.map(pt);
    L.shell = raw.shell ? raw.shell.map(pt) : null;
    L.floorBase = raw.floorBase || null;
    L.floors = raw.floors ? raw.floors.map(f => ({ type: f.type, poly: f.poly.map(pt) })) : null;
    L.walls = raw.walls.map(w => seg(w).concat([w[4] || 0]));
    L.windows = raw.windows.map(seg);
    L.doors = raw.doors.map(d => ({ gap: d.gap ? seg(d.gap) : null, leaf: d.leaf ? seg(d.leaf) : null, arc: !!d.arc }));
    // The doorway itself. Doors drawn with only a leaf open off the end of the wall at their hinge.
    L.doors.forEach(d => {
      d.opening = d.gap;
      if (d.gap || !d.leaf) return;
      const [hx, hy, ex, ey] = d.leaf, len = Math.hypot(ex - hx, ey - hy);
      const edges = L.outline.map((q, i) => q.concat(L.outline[(i + 1) % L.outline.length]));
      L.walls.map(w => w.slice(0, 4)).concat(edges).forEach(([x1, y1, x2, y2]) => [[x1, y1, x2, y2], [x2, y2, x1, y1]].forEach(([ax, ay, bx, by]) => {
        if (d.opening || Math.hypot(bx - hx, by - hy) > 1.5) return;
        const l = Math.hypot(bx - ax, by - ay) || 1;
        d.opening = [hx, hy, hx + (bx - ax) / l * len, hy + (by - ay) / l * len];
      }));
    });
    L.furn = raw.furn.map(f => {
      const t = f[0];
      if (t === "toilet") return { t, cx: sx(f[1]), cy: sy(f[2]), rx: f[3] / 2, ry: f[4] * k / 2, tank: box(f[5]) };
      if (t === "round" || t === "heater") return { t, cx: sx(f[1]), cy: sy(f[2]), r: f[3] / 2 };
      return Object.assign({ t, rot: f[5] || 0, label: f[6] || undefined, face: f[7] }, box(f.slice(1, 5)));   // face: which side the doors are on, when the plan can't tell
    });
    L.beds = raw.beds.map(b => Object.assign(box(b.r), { head: b.head, art: seg(b.art).concat(b.art.slice(4)) }));
    L.desks = raw.desks.map(d => Object.assign(box(d.r), { wall: d.wall, pedStart: d.ped === "start" }));
    L.rooms = raw.rooms.map(r => {
      const rug = r.rug ? box(r.rug) : null;
      return { rug: rug ? [rug.x, rug.y, rug.w, rug.h] : null, fridge: r.fridge ? pt(r.fridge) : undefined, bean: r.bean ? pt(r.bean) : undefined, extra: r.extra ? pt(r.extra) : undefined };
    });
    L.labels = raw.labels.map(l => pt(l).concat([l[2], l[3]]));
    const pts = L.outline.concat(L.shell || []);
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    L.x0 = Math.min.apply(null, xs); L.y0 = Math.min.apply(null, ys);
    L.w = Math.max.apply(null, xs) - L.x0; L.h = Math.max.apply(null, ys) - L.y0;
    L.cx = L.x0 + L.w / 2; L.cy = L.y0 + L.h / 2;
    L.wallT = raw.shell ? 6 : 4;
    if (raw.bedIn) L.beds.forEach(b => snapBed(L, b, raw.bedIn[0] * L.U, raw.bedIn[1] * L.U));
    fitFurniture(L, raw);
    return L;
  }

  // Resize a traced bed to UMBC's real frame, keeping its head against the same wall and its
  // long side against whichever wall it was drawn closest to. Its poster wall follows the new size.
  function snapBed(L, b, wid, len) {
    const horiz = b.head === "l" || b.head === "r";
    const lines = L.outline.map((p, i) => { const q = L.outline[(i + 1) % L.outline.length]; return [p[0], p[1], q[0], q[1]]; })
      .concat(L.walls.map(w => w.slice(0, 4)));
    // distance from a long edge (at coordinate c) to the nearest wall running alongside the bed
    const gap = c => Math.min.apply(null, lines.map(([x1, y1, x2, y2]) => {
      if (horiz && y1 === y2 && Math.max(x1, x2) > b.x && Math.min(x1, x2) < b.x + b.w) return Math.abs(y1 - c);
      if (!horiz && x1 === x2 && Math.max(y1, y2) > b.y && Math.min(y1, y2) < b.y + b.h) return Math.abs(x1 - c);
      return Infinity;
    }));
    if (horiz) {
      const x = b.head === "l" ? b.x : b.x + b.w - len;
      const y = gap(b.y) <= gap(b.y + b.h) ? b.y : b.y + b.h - wid;
      Object.assign(b, { x, y, w: len, h: wid });
    } else {
      const y = b.head === "t" ? b.y : b.y + b.h - len;
      const x = gap(b.x) <= gap(b.x + b.w) ? b.x : b.x + b.w - wid;
      Object.assign(b, { x, y, w: wid, h: len });
    }
    const a = b.art, inner = 3;
    if (a[1] === a[3]) { a[0] = b.x + inner; a[2] = b.x + b.w - inner; }
    else { a[1] = b.y + inner; a[3] = b.y + b.h - inner; }
  }
  /* ---------- Real furniture sizes, facing, and collision checks ---------- */
  // Inches, measured in UMBC's 360° tours: desks 42" × 24" (a pair spans 6′10″), wardrobes 48" × 24" × 70",
  // dining chairs 18" square. Beds are set in snapBed.
  const SIZE_IN = { desk: [42, 24], diningChair: 18, wardrobeH: 70 };
  const STORAGE = { wardrobe: 1, closet: 1, dresser: 1, pantry: 1 };
  const SEATS = { couch: 1, sofa: 1, loveseat: 1, chair: 1 };

  const centerOf = r => (r.r != null ? { x: r.cx, y: r.cy } : { x: r.x + r.w / 2, y: r.y + r.h / 2 });
  function furnRect(f) {
    if (f.t === "toilet") {
      const b = { x: f.cx - f.rx, y: f.cy - f.ry, w: 2 * f.rx, h: 2 * f.ry }, t = f.tank;
      const x = Math.min(b.x, t.x), y = Math.min(b.y, t.y);
      return { x, y, w: Math.max(b.x + b.w, t.x + t.w) - x, h: Math.max(b.y + b.h, t.y + t.h) - y };
    }
    if (f.r != null) return { x: f.cx - f.r, y: f.cy - f.r, w: 2 * f.r, h: 2 * f.r };
    if (!f.rot) return { x: f.x, y: f.y, w: f.w, h: f.h };
    const a = f.rot * Math.PI / 180, c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a));
    const w = f.w * c + f.h * s, h = f.w * s + f.h * c;
    return { x: f.x + f.w / 2 - w / 2, y: f.y + f.h / 2 - h / 2, w, h };
  }
  const overlaps = (a, b, tol) => a.x < b.x + b.w - tol && b.x < a.x + a.w - tol && a.y < b.y + b.h - tol && b.y < a.y + a.h - tol;
  const rectDist = (r, p) => Math.hypot(Math.max(r.x - p.x, 0, p.x - r.x - r.w), Math.max(r.y - p.y, 0, p.y - r.y - r.h));

  function wallLines(L) {
    if (!L._lines) {
      L._lines = L.outline.map((p, i) => { const q = L.outline[(i + 1) % L.outline.length]; return [p[0], p[1], q[0], q[1]]; })
        .concat(L.walls.map(w => w.slice(0, 4)));
    }
    return L._lines;
  }
  // Distance from one side of a rect out to the nearest wall running alongside it.
  function wallGap(L, r, side) {
    let best = Infinity;
    wallLines(L).forEach(([x1, y1, x2, y2]) => {
      if ((side === "t" || side === "b") && y1 === y2 && Math.max(x1, x2) > r.x + 1 && Math.min(x1, x2) < r.x + r.w - 1) {
        const d = side === "t" ? r.y - y1 : y1 - (r.y + r.h);
        if (d > -1) best = Math.min(best, Math.max(d, 0));
      }
      if ((side === "l" || side === "r") && x1 === x2 && Math.max(y1, y2) > r.y + 1 && Math.min(y1, y2) < r.y + r.h - 1) {
        const d = side === "l" ? r.x - x1 : x1 - (r.x + r.w);
        if (d > -1) best = Math.min(best, Math.max(d, 0));
      }
    });
    return best;
  }
  // Does any wall pass through the inside of a rect?
  function crossesWall(L, r, tol) {
    return wallLines(L).some(([x1, y1, x2, y2]) => {
      if (y1 === y2) return y1 > r.y + tol && y1 < r.y + r.h - tol && Math.max(x1, x2) > r.x + tol && Math.min(x1, x2) < r.x + r.w - tol;
      if (x1 === x2) return x1 > r.x + tol && x1 < r.x + r.w - tol && Math.max(y1, y2) > r.y + tol && Math.min(y1, y2) < r.y + r.h - tol;
      return false;
    });
  }
  // All four corners inside the plan, tested a hair inside so pieces flush with an outside wall count.
  function rectInside(L, r) {
    const e = 0.5;
    return [[r.x + e, r.y + e], [r.x + r.w - e, r.y + e], [r.x + e, r.y + r.h - e], [r.x + r.w - e, r.y + r.h - e]].every(([x, y]) => insidePlan(L, { x, y }));
  }
  function insidePlan(L, p) {
    let inside = false;
    const o = L.outline;
    for (let i = 0, j = o.length - 1; i < o.length; j = i++) {
      if ((o[i][1] > p.y) !== (o[j][1] > p.y) && p.x < (o[j][0] - o[i][0]) * (p.y - o[i][1]) / (o[j][1] - o[i][1]) + o[i][0]) inside = !inside;
    }
    return inside;
  }
  // The floor a door sweeps: the box around its hinge, leaf and the far end of its opening.
  function swingRect(d) {
    const pts = [[d.leaf[0], d.leaf[1]], [d.leaf[2], d.leaf[3]]];
    if (d.gap) pts.push([d.gap[0], d.gap[1]], [d.gap[2], d.gap[3]]);
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const x = Math.min.apply(null, xs), y = Math.min.apply(null, ys);
    return { x, y, w: Math.max.apply(null, xs) - x, h: Math.max.apply(null, ys) - y };
  }

  // Which side of a piece faces away from point p, in the piece's own unrotated frame.
  function sideAway(f, p) {
    const c = centerOf(f), a = -(f.rot || 0) * Math.PI / 180;
    const dx = (p.x - c.x) * Math.cos(a) - (p.y - c.y) * Math.sin(a), dy = (p.x - c.x) * Math.sin(a) + (p.y - c.y) * Math.cos(a);
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "l" : "r") : (dy > 0 ? "t" : "b");
  }
  // The long side of a sofa that sits closest to a wall.
  function wallBack(L, f) {
    const sides = f.w >= f.h ? ["t", "b"] : ["l", "r"];
    return wallGap(L, f, sides[0]) <= wallGap(L, f, sides[1]) ? sides[0] : sides[1];
  }
  // Pull a dining chair up to the table edge it belongs to, at real size.
  function tuckChair(L, f, table) {
    const t = furnRect(table), c = centerOf(f), s = SIZE_IN.diningChair * L.U, gap = L.U;
    let x, y;
    if (c.y < t.y) { x = c.x - s / 2; y = t.y - s - gap; }
    else if (c.y > t.y + t.h) { x = c.x - s / 2; y = t.y + t.h + gap; }
    else if (c.x < t.x) { x = t.x - s - gap; y = c.y - s / 2; }
    else { x = t.x + t.w + gap; y = c.y - s / 2; }
    Object.assign(f, { x, y, w: s, h: s, rot: 0 });
  }
  // Storage opens on the side with the most open floor in front of it.
  function frontSide(L, f) {
    const others = L.furn.filter(g => g !== f).map(furnRect).concat(L.beds, L.desks);
    let best = "t", score = -Infinity;
    ["t", "b", "l", "r"].forEach(side => {
      const long = (side === "t" || side === "b") === (f.w >= f.h);
      let free = Math.min(wallGap(L, f, side), 60 * L.U);
      const strip = side === "t" ? { x: f.x, y: f.y - 6 * L.U, w: f.w, h: 6 * L.U } : side === "b" ? { x: f.x, y: f.y + f.h, w: f.w, h: 6 * L.U }
        : side === "l" ? { x: f.x - 6 * L.U, y: f.y, w: 6 * L.U, h: f.h } : { x: f.x + f.w, y: f.y, w: 6 * L.U, h: f.h };
      if (others.some(o => overlaps(strip, o, L.U * 0.5))) free = 0;
      const sc = free * (long ? 1 : 0.5);
      if (sc > score) { score = sc; best = side; }
    });
    return best;
  }
  // Real-size beds can run an inch or two into a desk drawn beside them. Move the bed into open
  // floor if it can go; otherwise slide the desk along its wall.
  function separate(L) {
    // r is where `self` would move to; it must stay inside, off the walls, and clear of everything but `self`.
    const clear = (r, self) => rectInside(L, r)
      && !crossesWall(L, r, 0.2) && !L.beds.concat(L.desks, L.furn.map(furnRect)).some(o => o !== self && overlaps(r, o, 0.2));
    L.beds.forEach(b => {
      L.desks.concat(L.furn.filter(f => !f.r).map(furnRect)).forEach(o => {
        if (!overlaps(b, o, 0.2)) return;
        const px = Math.min(b.x + b.w - o.x, o.x + o.w - b.x), py = Math.min(b.y + b.h - o.y, o.y + o.h - b.y);
        const dx = px < py ? (b.x + b.w / 2 < o.x + o.w / 2 ? -px : px) : 0, dy = px < py ? 0 : (b.y + b.h / 2 < o.y + o.h / 2 ? -py : py);
        const moved = { x: b.x + dx, y: b.y + dy, w: b.w, h: b.h };
        if (clear(moved, b)) { Object.assign(b, moved); fitArt(b); return; }
        if (L.desks.indexOf(o) >= 0) {
          const alongWall = o.wall === "l" || o.wall === "r" ? { x: o.x, y: o.y - dy, w: o.w, h: o.h } : { x: o.x - dx, y: o.y, w: o.w, h: o.h };
          if (clear(alongWall, o)) { Object.assign(o, alongWall); return; }
        }
        // Bed, desk and storage traced end to end can come out an inch too long at real sizes. Shorten
        // the desk at the bed end by up to 4" so it stays against its wall.
        if (L.desks.includes(o)) {
          const vertical = o.wall === "l" || o.wall === "r", cut = (vertical ? py : px) + 0.1;
          if (cut <= 4 * L.U) {
            const bedFirst = vertical ? b.y + b.h / 2 < o.y + o.h / 2 : b.x + b.w / 2 < o.x + o.w / 2;
            const shorter = vertical ? { x: o.x, y: bedFirst ? o.y + cut : o.y, w: o.w, h: o.h - cut }
              : { x: bedFirst ? o.x + cut : o.x, y: o.y, w: o.w - cut, h: o.h };
            if (clear(shorter, o)) { Object.assign(o, shorter); return; }
          }
        }
        // Preserve physical dimensions. Search nearby positions for the desk along its wall.
        if (L.desks.includes(o)) {
          let found = false;
          for (let radius = 1; radius <= 24 && !found; radius++) {
            const candidates = [];
            for (let dx = -radius; dx <= radius; dx++) for (let dy = -radius; dy <= radius; dy++) {
              if (Math.max(Math.abs(dx), Math.abs(dy)) === radius) candidates.push([dx, dy]);
            }
            candidates.sort((a,b) => Math.hypot(...a) - Math.hypot(...b));
            for (const [dx,dy] of candidates) {
              const candidate = { x: o.x + dx * L.U, y: o.y + dy * L.U, w: o.w, h: o.h };
              if (clear(candidate, o)) { Object.assign(o, candidate); found = true; break; }
            }
          }
        }
      });
    });
  }
  // Interior walls are drawn 3.5" thick (or as traced) centred on their line. Pieces traced flush to the
  // line would sit inside the wall, so move them out to the wall's face.
  const wallHalf = (L, w) => (w[4] ? w[4] : 3.5 * L.U) / 2;
  function clearInteriorWalls(L) {
    // Built-in closets fill the space between walls, so they stay where they're drawn.
    const pieces = L.beds.concat(L.desks, L.furn.filter(f => (STORAGE[f.t] || SEATS[f.t]) && f.t !== "closet" && f.t !== "pantry" && !f.rot));
    pieces.forEach(p => {
      L.walls.forEach(w => {
        const h = wallHalf(L, w);
        if (w[1] === w[3]) {
          if (Math.max(w[0], w[2]) <= p.x + 0.5 || Math.min(w[0], w[2]) >= p.x + p.w - 0.5) return;
          const y = w[1];
          if (p.y < y + h - 0.01 && p.y > y - h - 0.3 && p.y + p.h > y + h) p.y = y + h;
          else if (p.y + p.h > y - h + 0.01 && p.y + p.h < y + h + 0.3 && p.y < y - h) p.y = y - h - p.h;
        } else if (w[0] === w[2]) {
          if (Math.max(w[1], w[3]) <= p.y + 0.5 || Math.min(w[1], w[3]) >= p.y + p.h - 0.5) return;
          const x = w[0];
          if (p.x < x + h - 0.01 && p.x > x - h - 0.3 && p.x + p.w > x + h) p.x = x + h;
          else if (p.x + p.w > x - h + 0.01 && p.x + p.w < x + h + 0.3 && p.x < x - h) p.x = x - h - p.w;
        }
      });
    });
    L.beds.forEach(fitArt);
  }
  // Posters and wallpaper hang on the wall beside the bed, never across a window or doorway. Start with
  // the traced wall; if less than 30" of it is clear, use whichever wall beside the bed has the most.
  function chooseArt(L, b) {
    const blockers = L.windows.concat(L.doors.filter(d => d.opening).map(d => d.opening));
    const freeRuns = c => {
      const hz = c[1] === c[3], line = hz ? c[1] : c[0];
      let free = [[hz ? Math.min(c[0], c[2]) : Math.min(c[1], c[3]), hz ? Math.max(c[0], c[2]) : Math.max(c[1], c[3])]];
      blockers.forEach(w => {
        if ((w[1] === w[3]) !== hz || Math.abs((hz ? w[1] : w[0]) - line) > 3 * L.U) return;
        const a = (hz ? Math.min(w[0], w[2]) : Math.min(w[1], w[3])) - 3 * L.U, z = (hz ? Math.max(w[0], w[2]) : Math.max(w[1], w[3])) + 3 * L.U;
        free = free.reduce((out, [u, v]) => out.concat(z <= u || a >= v ? [[u, v]] : [[u, Math.min(v, a)], [Math.max(u, z), v]].filter(([m, n]) => n - m > 0.5)), []);
      });
      return free.map(([u, v]) => (hz ? [u, line, v, line, c[4], c[5]] : [line, u, line, v, c[4], c[5]]));
    };
    const runLen = a => Math.abs(a[1] === a[3] ? a[2] - a[0] : a[3] - a[1]);
    const longest = list => list.reduce((best, a) => (!best || runLen(a) > runLen(best) ? a : best), null);
    const traced = longest(freeRuns(b.art));
    if (traced && runLen(traced) >= 30 * L.U) { b.art = traced; return; }
    const cands = [];
    ["t", "b", "l", "r"].forEach(side => {
      const g = wallGap(L, b, side);
      if (g > 14 * L.U) return;
      if (side === "t") cands.push([b.x + 3, b.y - g, b.x + b.w - 3, b.y - g, 0, 1]);
      if (side === "b") cands.push([b.x + 3, b.y + b.h + g, b.x + b.w - 3, b.y + b.h + g, 0, -1]);
      if (side === "l") cands.push([b.x - g, b.y + 3, b.x - g, b.y + b.h - 3, 1, 0]);
      if (side === "r") cands.push([b.x + b.w + g, b.y + 3, b.x + b.w + g, b.y + b.h - 3, -1, 0]);
    });
    const best = longest(cands.map(c => longest(freeRuns(c))).filter(Boolean).concat(traced ? [traced] : []));
    b.art = best && runLen(best) >= 18 * L.U ? best : null;
  }
  // How far a wall's face sits from its line: outside walls are built outward, interior walls are centred.
  function artFace(L, a) {
    const hz = a[1] === a[3], line = hz ? a[1] : a[0], lo = hz ? Math.min(a[0], a[2]) : Math.min(a[1], a[3]), hi = hz ? Math.max(a[0], a[2]) : Math.max(a[1], a[3]);
    const on = (x1, y1, x2, y2) => (hz ? y1 === y2 && Math.abs(y1 - line) < 1 && Math.max(x1, x2) > lo && Math.min(x1, x2) < hi
      : x1 === x2 && Math.abs(x1 - line) < 1 && Math.max(y1, y2) > lo && Math.min(y1, y2) < hi);
    const edges = L.outline.map((p, i) => { const q = L.outline[(i + 1) % L.outline.length]; return [p[0], p[1], q[0], q[1]]; });
    if (edges.some(e => on.apply(null, e))) return 0;
    const w = L.walls.find(w => on(w[0], w[1], w[2], w[3]));
    return w ? wallHalf(L, w) : 0;
  }
  function fitArt(b) {
    const a = b.art, inner = 3;
    if (!a) return;
    if (a[1] === a[3]) { a[0] = b.x + inner; a[2] = b.x + b.w - inner; }
    else { a[1] = b.y + inner; a[3] = b.y + b.h - inner; }
  }
  function resizeDesk(d, len, dep) {
    if (d.wall === "l" || d.wall === "r") {
      const cy = d.y + d.h / 2, x = d.wall === "l" ? d.x : d.x + d.w - dep;
      Object.assign(d, { x, y: cy - len / 2, w: dep, h: len });
    } else {
      const cx = d.x + d.w / 2, y = d.wall === "t" ? d.y : d.y + d.h - dep;
      Object.assign(d, { x: cx - len / 2, y, w: len, h: dep });
    }
  }

  // Everything that takes up floor: beds, desks, the desk chairs UMBC provides, and the drawn furniture.
  // How far a storage unit's doors reach into the room, in inches: freestanding wardrobes have two hinged doors,
  // built-in closets have bi-fold doors up to 5' wide and sliding doors beyond, a pantry has one door.
  function doorReach(f, len) {
    if (f.t === "dresser") return 18;
    if (f.t === "pantry") return len;
    if (f.t === "closet") return len > 60 ? 0 : len < 36 ? len : len / 4;
    return len / 2;
  }
  // Slide a desk along its wall when closet doors would hit it or its chair, or its chair can't roll back.
  function clearUse(L) {
    const tol = 0.75 * L.U, chairRect = d => { const c = chairSpot(L, d); return { x: c.x - c.s / 2, y: c.y - c.s / 2, w: c.s, h: c.s }; };
    const swings = L.doors.filter(x => x.leaf).map(swingRect);
    const blocked = d => {
      const zones = use(L), mine = zones.find(z => z.owner === d), cr = chairRect(d);
      const others = solids(L).filter(o => o.src !== d && o.with !== d).map(o => o.r);
      return zones.some(z => !z.chair && (overlaps(z.r, d, tol) || overlaps(z.r, cr, tol))) ||
        (mine && (swings.concat(others).some(r => overlaps(mine.r, r, tol)))) ||
        others.some(r => overlaps(r, d, tol) || overlaps(r, cr, tol));
    };
    L.desks.forEach(d => {
      if (!d.wall || !blocked(d)) return;
      const vertical = d.wall === "l" || d.wall === "r", o = { x: d.x, y: d.y };
      for (let k = 1; k <= 36; k++) for (const sn of [1, -1]) {
        d.x = o.x + (vertical ? 0 : sn * k * L.U); d.y = o.y + (vertical ? sn * k * L.U : 0);
        if (rectInside(L, d) && !crossesWall(L, d, 0.2) && !blocked(d)) return;
      }
      d.x = o.x; d.y = o.y;   // nowhere better: the layout check will say so
    });
  }
  // Space in front of a rect, out to a given reach.
  function aheadOf(r, side, reach) {
    return side === "t" ? { x: r.x, y: r.y - reach, w: r.w, h: reach } : side === "b" ? { x: r.x, y: r.y + r.h, w: r.w, h: reach }
      : side === "l" ? { x: r.x - reach, y: r.y, w: reach, h: r.h } : { x: r.x + r.w, y: r.y, w: reach, h: r.h };
  }
  // The floor each thing needs to be used: a hinged closet or wardrobe door's swing, and 36" behind the desk
  // for the chair to roll back (as wide as the chair plus a little either side).
  function use(L) {
    const zones = [], OPPS = { t: "b", b: "t", l: "r", r: "l" };
    L.furn.forEach(f => {
      if (!STORAGE[f.t] || !f.front || f.rot || f.t === "dresser") return;
      const reach = doorReach(f, (f.front === "t" || f.front === "b" ? f.w : f.h) / L.U);
      if (reach) zones.push({ r: aheadOf(f, f.front, reach * L.U), owner: f, what: f.t + " doors" });
    });
    L.desks.forEach((d, i) => {
      if (!d.wall) return;
      const c = chairSpot(L, d), half = c.s / 2 + 2 * L.U, z = aheadOf(d, OPPS[d.wall], 36 * L.U);
      const r = d.wall === "t" || d.wall === "b" ? { x: c.x - half, y: z.y, w: 2 * half, h: z.h } : { x: z.x, y: c.y - half, w: z.w, h: 2 * half };
      zones.push({ r, owner: d, what: "desk chair " + L.bedNames[i] + " room to back up", chair: true });
    });
    return zones;
  }
  function solids(L) {
    const list = [];
    L.beds.forEach((b, i) => list.push({ r: b, src: b, what: "bed " + L.bedNames[i] }));
    L.desks.forEach((d, i) => {
      list.push({ r: d, src: d, what: "desk " + L.bedNames[i] });
      const c = chairSpot(L, d);
      list.push({ r: { x: c.x - c.s / 2, y: c.y - c.s / 2, w: c.s, h: c.s }, what: "desk chair " + L.bedNames[i], with: d });
    });
    L.furn.forEach(f => list.push({ r: furnRect(f), src: f, what: f.t + (f.dining ? " (dining)" : ""), with: f.table }));
    return list;
  }

  // Move each mini-fridge, beanbag and add-on spot to the nearest open floor in its room.
  const DECOR_IN = { fridge: [21, 21], bean: [32, 32], extra: [38, 20] };
  const RUG_IN = [[48, 72], [36, 60], [30, 48]];
  // Where people walk: shortest routes from the front door to every other door, each bedside, desk chair,
  // closet front and kitchen or bath fixture, kept about 6" clear of furniture and walls. Routes run on a
  // 3" grid; the walkway is the band about 21" wide around them. Decor stays off it where it can.
  function walkways(L) {
    const c = 3 * L.U, nx = Math.ceil(L.w / c) + 1, ny = Math.ceil(L.h / c) + 1, N = nx * ny;
    const cx = i => L.x0 + (i + 0.5) * c, cy = j => L.y0 + (j + 0.5) * c;
    const open = new Uint8Array(N), free = new Uint8Array(N);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) if (insidePlan(L, { x: cx(i), y: cy(j) })) { open[j * nx + i] = 1; free[j * nx + i] = 1; }
    // Clear cells near a rect or a wall line; "hard" also closes them to the walkway band.
    const clearRect = (r, pad, grid) => {
      const i0 = Math.max(0, Math.floor((r.x - pad - L.x0) / c)), i1 = Math.min(nx - 1, Math.floor((r.x + r.w + pad - L.x0) / c));
      const j0 = Math.max(0, Math.floor((r.y - pad - L.y0) / c)), j1 = Math.min(ny - 1, Math.floor((r.y + r.h + pad - L.y0) / c));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const dx = Math.max(r.x - cx(i), 0, cx(i) - r.x - r.w), dy = Math.max(r.y - cy(j), 0, cy(j) - r.y - r.h);
        if (Math.hypot(dx, dy) <= pad) grid[j * nx + i] = 0;
      }
    };
    const clearLine = ([x1, y1, x2, y2], pad, grid) => {
      const i0 = Math.max(0, Math.floor((Math.min(x1, x2) - pad - L.x0) / c)), i1 = Math.min(nx - 1, Math.floor((Math.max(x1, x2) + pad - L.x0) / c));
      const j0 = Math.max(0, Math.floor((Math.min(y1, y2) - pad - L.y0) / c)), j1 = Math.min(ny - 1, Math.floor((Math.max(y1, y2) + pad - L.y0) / c));
      const vx = x2 - x1, vy = y2 - y1, len2 = vx * vx + vy * vy || 1;
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const t = Math.max(0, Math.min(1, ((cx(i) - x1) * vx + (cy(j) - y1) * vy) / len2));
        if (Math.hypot(cx(i) - x1 - t * vx, cy(j) - y1 - t * vy) <= pad) grid[j * nx + i] = 0;
      }
    };
    const things = solids(L).filter(o => !/desk chair/.test(o.what)).map(o => o.r);
    things.forEach(r => { clearRect(r, 6 * L.U, free); clearRect(r, 0, open); });
    wallLines(L).forEach(w => { clearLine(w, 5 * L.U, free); clearLine(w, c * 0.55, open); });

    const cellOf = (x, y) => [Math.floor((x - L.x0) / c), Math.floor((y - L.y0) / c)];
    // Nearest walkable cell to a point, searched outward a ring at a time (up to 2').
    const snap = (x, y) => {
      const [i0, j0] = cellOf(x, y);
      for (let rad = 0; rad <= 8; rad++) {
        let best = -1, bd = Infinity;
        for (let j = j0 - rad; j <= j0 + rad; j++) for (let i = i0 - rad; i <= i0 + rad; i++) {
          if (i < 0 || j < 0 || i >= nx || j >= ny || Math.max(Math.abs(i - i0), Math.abs(j - j0)) !== rad || !free[j * nx + i]) continue;
          const d = Math.hypot(cx(i) - x, cy(j) - y);
          if (d < bd) { bd = d; best = j * nx + i; }
        }
        if (best >= 0) return best;
      }
      return -1;
    };

    // Places people go.
    const goals = [], out = (r, side, d) => {
      const m = { t: [r.x + r.w / 2, r.y, 0, -1], b: [r.x + r.w / 2, r.y + r.h, 0, 1], l: [r.x, r.y + r.h / 2, -1, 0], r: [r.x + r.w, r.y + r.h / 2, 1, 0] }[side];
      return [m[0] + m[2] * d, m[1] + m[3] * d];
    };
    const openSide = (r, sides) => sides.reduce((a, b) => (wallGap(L, r, b) > wallGap(L, r, a) ? b : a));
    L.doors.forEach(d => {
      if (!d.opening) return;
      const [x1, y1, x2, y2] = d.opening, mx = (x1 + x2) / 2, my = (y1 + y2) / 2, len = Math.hypot(x2 - x1, y2 - y1) || 1;
      const n = [-(y2 - y1) / len, (x2 - x1) / len], k = 18 * L.U;
      goals.push([mx, my], [mx + n[0] * k, my + n[1] * k], [mx - n[0] * k, my - n[1] * k]);
    });
    L.beds.forEach(b => { const horiz = b.head === "l" || b.head === "r"; goals.push(out(b, openSide(b, horiz ? ["t", "b"] : ["l", "r"]), 14 * L.U)); });
    L.desks.forEach(d => { const ch = chairSpot(L, d); goals.push([ch.x, ch.y]); });
    L.furn.forEach(f => {
      if (f.rot) return;
      const r = furnRect(f);
      if (STORAGE[f.t] && f.front) goals.push(out(r, f.front, 15 * L.U));
      else if (/^(counter|range|ksink|sink|toilet|tub|washer|dryer|appl)$/.test(f.t)) goals.push(out(r, openSide(r, ["t", "b", "l", "r"]), 15 * L.U));
    });

    // Start at the front doors: every doorway on the outside wall (or the first door if none is).
    const edges = L.outline.map((p, i) => [p[0], p[1], L.outline[(i + 1) % L.outline.length][0], L.outline[(i + 1) % L.outline.length][1]]);
    const onOutline = d => { const mx = (d.opening[0] + d.opening[2]) / 2, my = (d.opening[1] + d.opening[3]) / 2;
      return edges.some(([x1, y1, x2, y2]) => { const vx = x2 - x1, vy = y2 - y1, t = Math.max(0, Math.min(1, ((mx - x1) * vx + (my - y1) * vy) / (vx * vx + vy * vy || 1))); return Math.hypot(mx - x1 - t * vx, my - y1 - t * vy) < 2 * L.U; }); };
    let fronts = L.doors.filter(d => d.opening && onOutline(d));
    if (!fronts.length) fronts = L.doors.filter(d => d.opening).slice(0, 1);
    const roots = fronts.map(front => {
      const fg = front.opening, fl = Math.hypot(fg[2] - fg[0], fg[3] - fg[1]) || 1, fn = [-(fg[3] - fg[1]) / fl, (fg[2] - fg[0]) / fl];
      const fm = [(fg[0] + fg[2]) / 2, (fg[1] + fg[3]) / 2], inPt = insidePlan(L, { x: fm[0] + fn[0] * 12 * L.U, y: fm[1] + fn[1] * 12 * L.U }) ? 1 : -1;
      return snap(fm[0] + inPt * fn[0] * 9 * L.U, fm[1] + inPt * fn[1] * 9 * L.U);
    }).filter(k => k >= 0);
    if (!roots.length) return null;

    // Dijkstra over walkable cells, eight ways (no cutting corners).
    const dist = new Float64Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1), heap = [];
    const push = (k, d) => { heap.push([d, k]); let i = heap.length - 1; while (i) { const pi = (i - 1) >> 1; if (heap[pi][0] <= heap[i][0]) break; [heap[pi], heap[i]] = [heap[i], heap[pi]]; i = pi; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
    roots.forEach(k => { dist[k] = 0; push(k, 0); });
    const STEPS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]];
    while (heap.length) {
      const [d, k] = pop();
      if (d > dist[k]) continue;
      const i = k % nx, j = (k - i) / nx;
      for (const [di, dj, w] of STEPS) {
        const a = i + di, b = j + dj;
        if (a < 0 || b < 0 || a >= nx || b >= ny) continue;
        const q = b * nx + a;
        if (!free[q] || (di && dj && (!free[j * nx + a] || !free[b * nx + i]))) continue;
        if (d + w < dist[q]) { dist[q] = d + w; prev[q] = k; push(q, d + w); }
      }
    }

    // People share a main path and branch off it, so routes are built as a tree: goals are taken nearest the
    // front door first, and each one joins the routes already there by its own shortest way. Then the routes
    // are widened into a band about 21" wide that stops at walls and furniture.
    const band = new Uint8Array(N), core = new Uint8Array(N), onRoute = new Uint8Array(N), lines = [], queue = [];
    const mark = k => { onRoute[k] = 1; if (!band[k]) { band[k] = 1; queue.push([k, 0]); } };
    roots.forEach(mark);
    const targets = [...new Set(goals.map(([x, y]) => snap(x, y)))].filter(k => k >= 0 && isFinite(dist[k])).sort((p, q) => dist[p] - dist[q]);
    const d2 = new Float64Array(N), from = new Int32Array(N), stamp = new Int32Array(N);
    targets.forEach((k0, run) => {
      if (onRoute[k0]) return;
      // Dijkstra out from the goal until it reaches the routes.
      const id = run + 1, h = [];
      const hpush = (k, d) => { h.push([d, k]); let i = h.length - 1; while (i) { const pi = (i - 1) >> 1; if (h[pi][0] <= h[i][0]) break; [h[pi], h[i]] = [h[i], h[pi]]; i = pi; } };
      const hpop = () => { const top = h[0], last = h.pop(); if (h.length) { h[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < h.length && h[l][0] < h[m][0]) m = l; if (r < h.length && h[r][0] < h[m][0]) m = r; if (m === i) break; [h[m], h[i]] = [h[i], h[m]]; i = m; } } return top; };
      stamp[k0] = id; d2[k0] = 0; from[k0] = -1; hpush(k0, 0);
      let hit = -1;
      while (h.length) {
        const [d, k] = hpop();
        if (d > d2[k]) continue;
        if (onRoute[k]) { hit = k; break; }
        const i = k % nx, j = (k - i) / nx;
        for (const [di, dj, w] of STEPS) {
          const a = i + di, b = j + dj;
          if (a < 0 || b < 0 || a >= nx || b >= ny) continue;
          const q = b * nx + a;
          if (!free[q] || (di && dj && (!free[j * nx + a] || !free[b * nx + i]))) continue;
          if (stamp[q] !== id || d + w < d2[q]) { stamp[q] = id; d2[q] = d + w; from[q] = k; hpush(q, d + w); }
        }
      }
      if (hit < 0) return;
      const pts = [];
      for (let k = hit; k >= 0; k = from[k]) { const i = k % nx, j = (k - i) / nx; pts.push([cx(i), cy(j)]); mark(k); }
      if (pts.length > 1) lines.push(pts);
    });
    const R = 3;   // cells either side of the route: about 9", so the walkway is about 21" wide
    while (queue.length) {
      const [k, d] = queue.shift();
      if (d <= 1) core[k] = 1;   // the middle 9" or so: where feet actually go
      if (d >= R) continue;
      const i = k % nx, j = (k - i) / nx;
      for (const [di, dj] of STEPS) {
        const a = i + di, b = j + dj, q = b * nx + a;
        if (a < 0 || b < 0 || a >= nx || b >= ny || band[q] || !open[q]) continue;
        band[q] = 1; queue.push([q, d + 1]);
      }
    }
    // How much a rect gets in the way: 0 clear, 1 on the edge of a walkway, 2 across the middle of one.
    const hits = r => {
      const i0 = Math.max(0, Math.ceil((r.x - L.x0) / c - 0.5)), i1 = Math.min(nx - 1, Math.floor((r.x + r.w - L.x0) / c - 0.5));
      const j0 = Math.max(0, Math.ceil((r.y - L.y0) / c - 0.5)), j1 = Math.min(ny - 1, Math.floor((r.y + r.h - L.y0) / c - 0.5));
      let worst = 0;
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        if (core[j * nx + i]) return 2;
        if (band[j * nx + i]) worst = 1;
      }
      return worst;
    };
    return { lines, hits };
  }

  // Place each mini-fridge, beanbag, rug and add-on on open floor. In a shared bedroom every student gets
  // their own set, kept in the part of the room nearest their own bed and desk, so nothing lands on a
  // roommate's side. The keyboard or easel goes against a wall whenever one is free.
  function placeDecor(L) {
    const all = solids(L), solid = all.map(s => s.r), floorSolid = all.filter(s => !/desk chair/.test(s.what)).map(s => s.r);
    const swings = L.doors.filter(d => d.leaf).map(swingRect), placed = [], step = 3 * L.U;
    // Keep the space people use clear (a rug can still go there): room to stand at a wardrobe, closet or
    // dresser with its doors or drawers open, and 36" in front of each desk for the chair to roll back.
    const fronts = [];
    const ahead = (r, side, reach) => (side === "t" ? { x: r.x, y: r.y - reach, w: r.w, h: reach } : side === "b" ? { x: r.x, y: r.y + r.h, w: r.w, h: reach }
      : side === "l" ? { x: r.x - reach, y: r.y, w: reach, h: r.h } : { x: r.x + r.w, y: r.y, w: reach, h: r.h });
    L.furn.forEach(f => {
      if (!STORAGE[f.t] || !f.front || f.rot) return;
      const len = (f.front === "t" || f.front === "b" ? f.w : f.h) / L.U;
      const reach = f.t === "dresser" ? 30 : Math.min(30, Math.max(24, doorReach(f, len)));   // room to stand there, at least
      fronts.push(ahead(f, f.front, reach * L.U));
    });
    const OPP_SIDE = { t: "b", b: "t", l: "r", r: "l" };
    L.desks.forEach(d => { if (d.wall) fronts.push(ahead(d, OPP_SIDE[d.wall], 36 * L.U)); });
    // Is a rect backed against a wall or a piece of furniture on some side (so it isn't stranded mid-floor)?
    const backed = r => ["t", "b", "l", "r"].some(sd => wallAlong(L, r, sd) >= 0.5) ||
      solid.some(o => { const g = 2 * L.U;
        const nearX = o.x <= r.x + r.w + g && r.x <= o.x + o.w + g, nearY = o.y <= r.y + r.h + g && r.y <= o.y + o.h + g;
        return nearX && nearY && !overlaps(r, o, 0); });
    // Points in the bedroom. A piece must be in plain view of one of them with every doorway shut, so it
    // can't end up through a door in the bathroom or the hall.
    let seen = null, zoneId = "", walkAware = true;
    const shut = wallLines(L).concat(L.doors.filter(d => d.opening).map(d => d.opening));
    const inView = (ax, ay, bx, by) => !shut.some(([x1, y1, x2, y2]) => {
      const d = (bx - ax) * (y2 - y1) - (by - ay) * (x2 - x1);
      if (Math.abs(d) < 1e-9) return false;
      const t = ((x1 - ax) * (y2 - y1) - (y1 - ay) * (x2 - x1)) / d, u = ((x1 - ax) * (by - ay) - (y1 - ay) * (bx - ax)) / d;
      return t > 0.001 && t < 0.999 && u >= 0 && u <= 1;
    });

    // Nearest free spot to start, tried closest first. With preferWall, the nearest spot with its long side
    // against a wall wins, and the nearest spot anywhere is the fallback. Spots that clear the walls and the
    // fixed furniture are worked out once per start and size; each try then only checks what's been placed.
    const fixedSpots = new Map();
    const find = (start, size, b, region, opts) => {
      opts = opts || {};
      const fixedKey = [size[0], size[1], b.x0, b.y0, b.x1, b.y1, opts.rug ? 1 : 0, opts.preferWall ? 1 : 0, opts.optional ? 1 : 0, zoneId].join();
      const key = fixedKey + ":" + start.join();
      if (!fixedSpots.has(fixedKey)) {
        const blockers = opts.rug ? floorSolid.concat(swings) : solid.concat(swings, fronts), ok = [];
        const along = (a0, a1, len) => { const v = []; for (let a = a0 + len / 2; a <= a1 - len / 2 + 0.01; a += step) v.push(a); v.push(a1 - len / 2); return v; };
        (opts.preferWall || opts.rug ? [0, 90] : [0]).forEach(rot => {
          const w = (rot ? size[1] : size[0]) * L.U, h = (rot ? size[0] : size[1]) * L.U;
          along(b.x0, b.x1, w).forEach(x => along(b.y0, b.y1, h).forEach(y => {
            const r = { x: x - w / 2, y: y - h / 2, w, h };
            if (region && ![[r.x, r.y], [r.x + w, r.y], [r.x, r.y + h], [r.x + w, r.y + h]].every(([px, py]) => region(px, py))) return;
            if (blockers.some(o => overlaps(r, o, 0))) return;
            if (!rectInside(L, r) || crossesWall(L, r, 0.2)) return;
            if (seen && !seen.some(([px, py]) => inView(x, y, px, py))) return;
            const walk = !opts.rug && L.walk ? L.walk.hits(r) : 0;
            if (opts.optional && walk === 2) return;   // a beanbag or add-on never goes across the middle of a walkway
            const wall = opts.preferWall ? (rot ? ["l", "r"] : ["t", "b"]).find(sd => wallAlong(L, r, sd) >= 0.6) || null : null;
            ok.push({ x, y, w, h, rot, wall, r, walk, backed: opts.rug || opts.preferWall || backed(r) });
          }));
        });
        fixedSpots.set(fixedKey, ok);
      }
      if (!fixedSpots.has(key)) fixedSpots.set(key, fixedSpots.get(fixedKey).slice().sort((p, q) => Math.hypot(p.x - start[0], p.y - start[1]) - Math.hypot(q.x - start[0], q.y - start[1])));
      // Best spot: off the walkway first, then against a wall (for the add-on), then nearest.
      // A wall beats clear floor out in the room, but not the middle of a walkway.
      const rank = c => (walkAware ? c.walk * 2 : 0) + (opts.preferWall && !c.wall ? 3 : 0) + (c.backed ? 0 : 1);
      let best = null;
      for (const c of fixedSpots.get(key)) {
        if (best && rank(c) >= rank(best)) continue;
        if (!opts.rug && placed.some(o => overlaps(c.r, o, 0))) continue;
        best = c;
        if (rank(c) === 0) break;
      }
      if (best && !opts.rug) placed.push({ x: best.x - best.w / 2 - L.U, y: best.y - best.h / 2 - L.U, w: best.w + 2 * L.U, h: best.h + 2 * L.U });
      return best && { x: best.x, y: best.y, w: best.w, h: best.h, rot: best.rot, wall: best.wall, walk: best.walk };
    };
    // How much of one side of a rect has a wall running right behind it (0 to 1).
    const wallAlong = (L, r, side) => {
      const horiz = side === "t" || side === "b", line = side === "t" ? r.y : side === "b" ? r.y + r.h : side === "l" ? r.x : r.x + r.w;
      const a0 = horiz ? r.x : r.y, a1 = horiz ? r.x + r.w : r.y + r.h;
      let cover = 0;
      wallLines(L).forEach(([x1, y1, x2, y2]) => {
        if (horiz ? y1 !== y2 : x1 !== x2) return;
        const at = horiz ? y1 : x1, out = side === "t" || side === "l" ? line - at : at - line;
        if (out < -L.U || out > 2 * L.U) return;
        const lo = Math.max(a0, Math.min(horiz ? x1 : y1, horiz ? x2 : y2)), hi = Math.min(a1, Math.max(horiz ? x1 : y1, horiz ? x2 : y2));
        cover += Math.max(0, hi - lo);
      });
      return Math.min(1, cover / (a1 - a0));
    };
    const bedsIn = ri => L.beds.map((b, i) => (L.bedRoom[i] === ri ? i : -1)).filter(i => i >= 0);
    const boundsOf = (room, ri) => {
      const beds = bedsIn(ri);
      const parts = beds.map(i => L.beds[i]).concat(beds.map(i => L.desks[i]));
      if (room.rug) parts.push({ x: room.rug[0], y: room.rug[1], w: room.rug[2], h: room.rug[3] });
      Object.keys(DECOR_IN).forEach(k => { if (room[k]) parts.push({ x: room[k][0], y: room[k][1], w: 0, h: 0 }); });
      const b = { x0: Math.min.apply(null, parts.map(p => p.x)), y0: Math.min.apply(null, parts.map(p => p.y)),
        x1: Math.max.apply(null, parts.map(p => p.x + p.w)), y1: Math.max.apply(null, parts.map(p => p.y + p.h)) };
      if (!beds.length) { const m = 30 * L.U; b.x0 -= m; b.y0 -= m; b.x1 += m; b.y1 += m; return b; }
      // A bedroom reaches out to its walls: cast from the middle of the beds and desks to the nearest wall each way.
      const c = { x: 0, y: 0 };
      parts.slice(0, beds.length * 2).forEach(p => { c.x += (p.x + p.w / 2) / (beds.length * 2); c.y += (p.y + p.h / 2) / (beds.length * 2); });
      const wallBox = { x0: -Infinity, y0: -Infinity, x1: Infinity, y1: Infinity };
      wallLines(L).forEach(([x1, y1, x2, y2]) => {
        if (x1 === x2 && Math.min(y1, y2) <= c.y && Math.max(y1, y2) >= c.y) { if (x1 < c.x) wallBox.x0 = Math.max(wallBox.x0, x1); else wallBox.x1 = Math.min(wallBox.x1, x1); }
        if (y1 === y2 && Math.min(x1, x2) <= c.x && Math.max(x1, x2) >= c.x) { if (y1 < c.y) wallBox.y0 = Math.max(wallBox.y0, y1); else wallBox.y1 = Math.min(wallBox.y1, y1); }
      });
      const pick = (v, f, d) => (isFinite(v) ? f(v, d) : d);
      return { x0: pick(wallBox.x0, Math.min, b.x0), y0: pick(wallBox.y0, Math.min, b.y0), x1: pick(wallBox.x1, Math.max, b.x1), y1: pick(wallBox.y1, Math.max, b.y1) };
    };
    const putExtra = (target, start, b, region, compact) => {
      // Full size unless the compact one gets a better spot: off the walkway, then against a wall.
      const rank = h => (walkAware ? h.walk * 2 : 0) + (h.wall ? 0 : 3);
      let pick = null;
      for (const size of compact ? [[24, 18]] : [DECOR_IN.extra, [24, 18]]) {
        const mark = placed.length, hit = find(start, size, b, region, { preferWall: true, optional: true });
        if (!hit) continue;
        if (!pick || rank(hit) < rank(pick.hit)) { if (pick) placed.splice(pick.mark, 1); pick = { hit, size, mark: placed.length - 1 }; } else placed.splice(mark, 1);
        if (rank(hit) === 0) break;
      }
      if (pick) {
        const { hit, size } = pick;
        Object.assign(target, { extra: [hit.x, hit.y], extraW: size[0], extraRot: hit.rot, extraWall: hit.wall });
        target.onWalk = (target.onWalk || 0) + hit.walk;
        return;
      }
      target.extra = null;   // no room for it here
    };
    // Fridge, beanbag and add-on for one room or one student. Try them in every order and keep the one
    // that places the most, with the add-on on a wall and everything at full size where it can be.
    const ORDERS = [["extra", "fridge", "bean"], ["extra", "bean", "fridge"], ["fridge", "extra", "bean"],
      ["bean", "extra", "fridge"], ["fridge", "bean", "extra"], ["bean", "fridge", "extra"]];
    const putSet = (target, src, startOf, b, region) => {
      let best = null;
      // compact: start from the smaller beanbag and add-on, for corners too tight for all three at full size
      // Last resort: ignore the walkways, for corners where keeping clear of them leaves no room for everything.
      [[false, true], [true, true], [false, false], [true, false]].forEach(([compact, aware]) => ORDERS.forEach(order => {
        if (best && best.miss === 0) return;   // nothing left to improve
        if (!aware && best && best.miss < 100) return;
        walkAware = aware;
        const mark = placed.length, t = {};
        order.forEach(k => {
          if (!src[k]) return;
          if (k === "extra") { putExtra(t, startOf(k), b, region, compact); return; }
          t[k] = null;
          for (const size of k === "bean" ? (compact ? [[26, 26]] : [DECOR_IN.bean, [26, 26]]) : [DECOR_IN[k]]) {   // a smaller beanbag where space is tight
            // the fridge goes against a wall when it can, like a fridge at home
            const hit = find(startOf(k), size, b, region, { optional: k === "bean", preferWall: k === "fridge" });
            if (hit) {
              t[k] = [hit.x, hit.y]; t.onWalk = (t.onWalk || 0) + hit.walk;
              if (k === "bean") t.beanD = size[0];
              if (k === "fridge") t.fridgeWall = hit.wall;
              break;
            }
          }
        });
        const miss = ["extra", "fridge", "bean"].filter(k => src[k] && !t[k]).length * 100 + (t.onWalk || 0) * 4 + (t.extra && !t.extraWall ? 3 : 0) + (t.fridge && !t.fridgeWall ? 2 : 0)
          + (t.extra && t.extraW < DECOR_IN.extra[0] ? 2 : 0) + (t.beanD && t.beanD < DECOR_IN.bean[0] ? 2 : 0);
        const added = placed.splice(mark);
        if (!best || miss < best.miss) best = { miss, t, added };
      }));
      walkAware = true;
      placed.push.apply(placed, best.added);
      Object.assign(target, best.t);
      return best.miss;
    };
    L.rooms.forEach((room, ri) => {
      if (bedsIn(ri).length > 1) return;
      const b = boundsOf(room, ri), beds = bedsIn(ri);
      zoneId = "room" + ri;
      seen = beds.length ? beds.map(i => centerOf(L.beds[i])).concat(beds.map(i => centerOf(L.desks[i]))).map(p => [p.x, p.y]) : null;
      putSet(room, room, k => room[k], b, null);
    });
    L.bedSpots = L.beds.map(() => null);
    L.rooms.forEach((room, ri) => {
      const beds = bedsIn(ri);
      if (beds.length < 2) return;
      const b = boundsOf(room, ri);
      const zone = beds.map(i => { const p = centerOf(L.beds[i]), d = centerOf(L.desks[i]); return { x: (p.x + d.x) / 2, y: (p.y + d.y) / 2 }; });
      // Roommates who all order share one big rug (anywhere in the room) and one mini-fridge.
      const mid = [zone.reduce((a, z) => a + z.x, 0) / zone.length, zone.reduce((a, z) => a + z.y, 0) / zone.length];
      seen = beds.map(i => centerOf(L.beds[i])).concat(beds.map(i => centerOf(L.desks[i]))).map(p => [p.x, p.y]);
      zoneId = "shared" + ri;
      room.shared = {};
      if (room.rug) for (const size of [[60, 96], [48, 72]]) {
        const hit = find(mid, size, b, null, { rug: true });
        if (hit) { room.shared.rug = [hit.x - hit.w / 2, hit.y - hit.h / 2, hit.w, hit.h]; break; }
      }
      // Each student's own set, in their part of the room. Students are placed one after another, so try
      // each order and keep the one that fits the most.
      const orders = beds.length === 2 ? [[0, 1], [1, 0]] : [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
      let bestRun = null;
      orders.forEach(order => {
        if (bestRun && bestRun.score === 0) return;
        const mark = placed.length, spots = {};
        let score = 0;
        order.forEach(n => {
          const i = beds[n];
          const mine = (x, y) => zone.every((z, m) => m === n || Math.hypot(x - zone[n].x, y - zone[n].y) <= Math.hypot(x - z.x, y - z.y) + 0.01);
          const start = [zone[n].x, zone[n].y], spot = {}, bc = centerOf(L.beds[i]), dc = centerOf(L.desks[i]);
          seen = [start, [bc.x, bc.y], [dc.x, dc.y]];
          zoneId = "bed" + i;
          if (room.rug) {
            for (const size of RUG_IN) {
              const hit = find(start, size, b, mine, { rug: true });
              if (hit) { spot.rug = [hit.x - hit.w / 2, hit.y - hit.h / 2, hit.w, hit.h]; break; }
            }
          }
          score += putSet(spot, room, () => start, b, mine);
          spots[i] = spot;
        });
        const added = placed.splice(mark);
        if (!bestRun || score < bestRun.score) bestRun = { score, spots, added };
      });
      placed.push.apply(placed, bestRun.added);
      beds.forEach(i => { L.bedSpots[i] = bestRun.spots[i]; });
      // The shared fridge takes one of the students' fridge spots (they already clear everyone's things): one
      // against a wall if there is one, then the one nearest the middle.
      if (room.fridge) room.shared.fridge = beds.map(i => L.bedSpots[i]).filter(sp => sp.fridge)
        .sort((p, q) => (!p.fridgeWall - !q.fridgeWall) || Math.hypot(p.fridge[0] - mid[0], p.fridge[1] - mid[1]) - Math.hypot(q.fridge[0] - mid[0], q.fridge[1] - mid[1]))
        .map(sp => sp.fridge)[0] || null;
    });
  }
  // Posters are all the standard 11" x 17" size, hung portrait in centered rows along the bed's poster wall:
  // five fit side by side beside a bed, two or three rows stack on the short wall at its head.
  const POSTER = { w: 11, h: 17, gap: 3, rowGap: 2.5 };
  function posterGrid(runIn, n) {
    const perRow = Math.max(1, Math.min(n, Math.floor((runIn + POSTER.gap) / (POSTER.w + POSTER.gap)))), rows = Math.ceil(n / perRow);
    return Array.from({ length: n }, (_, k) => {
      const row = Math.floor(k / perRow), inRow = Math.min(perRow, n - row * perRow), col = k - row * perRow;
      const rowW = inRow * POSTER.w + (inRow - 1) * POSTER.gap;
      return { along: (runIn - rowW) / 2 + col * (POSTER.w + POSTER.gap) + POSTER.w / 2, up: ((rows - 1) / 2 - row) * (POSTER.h + POSTER.rowGap) };
    });
  }
  // The decor sets to draw: one per ordered student in a shared bedroom (with a shared rug and fridge when the
  // whole room orders), one per room otherwise.
  function decorSets(L, bedOn, roomOn) {
    const sets = [];
    L.rooms.forEach((r, ri) => {
      if (!roomOn[ri]) return;
      const beds = L.bedRoom.map((x, i) => (x === ri ? i : -1)).filter(i => i >= 0);
      if (beds.length > 1 && L.bedSpots && beds.every(i => bedOn[i]) && r.shared) {
        // everyone in the room ordered: one shared rug and fridge, plus each student's own beanbag and add-on
        sets.push({ rug: r.shared.rug, fridge: r.shared.fridge });
        beds.forEach(i => { const sp = L.bedSpots[i]; if (sp) sets.push(Object.assign({}, sp, { rug: null, fridge: null })); });
      } else if (beds.length > 1 && L.bedSpots) beds.forEach(i => { if (bedOn[i] && L.bedSpots[i]) sets.push(L.bedSpots[i]); });
      else sets.push(r);
    });
    return sets;
  }
  // Unit vector pointing into the room from the wall an add-on stands against (or, out in the room, across its short side).
  const facingOf = r => ({ t: [0, 1], b: [0, -1], l: [1, 0], r: [-1, 0] })[r.extraWall] || (r.extraRot ? [1, 0] : [0, 1]);

  // Report anything that overlaps something else, a wall, or a door's swing.
  function layoutIssues(L) {
    const items = solids(L), swings = L.doors.filter(d => d.leaf).map(d => ({ r: swingRect(d) })), issues = [];
    const tol = 0.75 * L.U;
    items.forEach((a, i) => {
      items.slice(i + 1).forEach(b => {
        if ((a.with && a.with === b.src) || (b.with && b.with === a.src)) return;
        if (/^counter/.test(a.what) && /^(range|ksink|appl)/.test(b.what) || /^counter/.test(b.what) && /^(range|ksink|appl)/.test(a.what)) return;
        if (overlaps(a.r, b.r, tol)) issues.push(a.what + " overlaps " + b.what);
      });
      if (crossesWall(L, a.r, tol)) issues.push(a.what + " crosses a wall");
      if (/chair|bed|desk|couch|sofa|loveseat|table|coffee|end/.test(a.what) && swings.some(s => overlaps(a.r, s.r, tol))) issues.push(a.what + " is in a door's swing");
    });
    // Room to use things: every closet and wardrobe door swings open, and every desk chair can roll back 36".
    use(L).forEach(z => {
      items.forEach(b => { if (b.src !== z.owner && b.with !== z.owner && overlaps(z.r, b.r, tol)) issues.push(z.what + " is blocked by " + b.what); });
      if (z.chair && swings.some(sw => overlaps(z.r, sw.r, tol))) issues.push(z.what + " is in a door's swing");
    });
    // A beanbag or add-on may be left off when the only floor left would block a desk, closet or walkway (the
    // item list says so); a missing mini-fridge is a real problem.
    L.rooms.forEach((r, ri) => { if (r.fridge === null) issues.push("fridge in room " + ri + " has no free spot"); });
    (L.bedSpots || []).forEach((sp, i) => { if (sp && sp.fridge === null) issues.push("fridge for bed " + L.bedNames[i] + " has no free spot"); });
    L.rooms.forEach((r, ri) => { if (r.shared && r.shared.fridge === null) issues.push("shared fridge in room " + ri + " has no free spot"); });
    return issues;
  }

  // Applied once per layout after scaling: real desk sizes, seating that faces the right way,
  // storage fronts, and decor moved clear of everything else.
  function fitFurniture(L, raw) {
    if (raw.deskIn) L.desks.forEach(d => resizeDesk(d, raw.deskIn[0] * L.U, raw.deskIn[1] * L.U));
    // Freestanding wardrobes: 48-inch front, 24-inch depth. Built-in closets retain their plan footprint.
    L.furn.filter(f => f.t === "wardrobe").forEach(f => {
      const vertical = f.h >= f.w, old = { ...f };
      const w = (vertical ? 24 : 48) * L.U, h = (vertical ? 48 : 24) * L.U;
      const side = wallGap(L, old, "l") <= wallGap(L, old, "r") ? "l" : "r";
      f.x = side === "l" ? old.x : old.x + old.w - w;
      f.y = old.y + old.h / 2 - h / 2; f.w = w; f.h = h;
    });
    separate(L);
    clearInteriorWalls(L);
    L.beds.forEach(b => chooseArt(L, b));
    const tables = L.furn.filter(f => f.t === "table" || f.t === "round");
    const lounge = L.furn.filter(f => f.t === "coffee" || f.t === "couch" || f.t === "sofa" || f.t === "loveseat");
    L.furn.forEach(f => {
      if (!SEATS[f.t]) return;
      if (f.t === "chair") {
        const near = tables.map(t => ({ t, d: rectDist(furnRect(t), centerOf(f)) })).sort((a, b) => a.d - b.d)[0];
        if (near && near.d < 30 * L.U && Math.max(f.w, f.h) < 26 * L.U) {
          tuckChair(L, f, near.t);
          f.dining = true; f.table = near.t;
          f.back = sideAway(f, centerOf(near.t));
          return;
        }
        const focus = lounge.map(t => ({ t, d: rectDist(furnRect(t), centerOf(f)) })).sort((a, b) => a.d - b.d)[0];
        if (focus && focus.d < 110 * L.U) { f.back = sideAway(f, centerOf(focus.t)); return; }
      }
      f.back = wallBack(L, f);
    });
    L.furn.forEach(f => { if (STORAGE[f.t]) f.front = f.face || frontSide(L, f); });
    clearUse(L);
    L.walk = walkways(L);
    placeDecor(L);
  }

  const LAYOUTS = {};
  // Each layout is fitted the first time it's used, so the page doesn't fit all nine before it can draw.
  Object.keys(RAW_LAYOUTS).forEach(k => {
    let L = null;
    Object.defineProperty(LAYOUTS, k, { enumerable: true, get: () => L || (L = prepLayout(RAW_LAYOUTS[k])) });
  });
  if (typeof document !== "undefined" && document.getElementById("plannerForm")) setTimeout(() => Object.keys(LAYOUTS).forEach(k => { const issues = layoutIssues(LAYOUTS[k]); if (issues.length) console.warn("Layout check · " + k + ": " + issues.join("; ")); }), 1500);

  const FURN_LABEL = { wardrobe: "Wardrobe", closet: "Closet", couch: "Couch", sofa: "Sofa", end: "End table", coffee: "Coffee table",
    loveseat: "Love seat", table: "Table", tv: "TV", washer: "W", dryer: "D", dresser: "Dresser", pantry: "P" };

  /* ---------- SVG helpers ---------- */
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function text(parent, x, y, str, cls, rotate) {
    const t = el("text", { x, y, class: cls, "text-anchor": "middle", "dominant-baseline": "central" }, parent);
    if (rotate) t.setAttribute("transform", "rotate(-90 " + x + " " + y + ")");
    t.textContent = str;
    return t;
  }
  function rectLabel(g, x, y, w, h, label) {
    if (!label) return;
    const vertical = h > w * 1.3 && w < 46;
    const room = vertical ? h : w;
    if (room < label.length * 4.4 + 4) return;
    text(g, x + w / 2, y + h / 2, label, "p-flabel", vertical);
  }
  function band(b, side, depth) {
    if (side === "t") return { x: b.x, y: b.y, w: b.w, h: depth };
    if (side === "b") return { x: b.x, y: b.y + b.h - depth, w: b.w, h: depth };
    if (side === "l") return { x: b.x, y: b.y, w: depth, h: b.h };
    return { x: b.x + b.w - depth, y: b.y, w: depth, h: b.h };
  }
  const OPP = { t: "b", b: "t", l: "r", r: "l" };
  function inset(r, d) { return { x: r.x + d, y: r.y + d, w: Math.max(0, r.w - 2 * d), h: Math.max(0, r.h - 2 * d) }; }
  function rect(g, r, attrs) { return el("rect", Object.assign({ x: r.x, y: r.y, width: r.w, height: r.h }, attrs), g); }
  // The far end of a door's opening, where the swing arc lands.
  function doorFar(d) {
    const [hx, hy] = d.leaf, g = d.gap;
    if (!g) return null;
    const d1 = Math.hypot(g[0] - hx, g[1] - hy), d2 = Math.hypot(g[2] - hx, g[3] - hy);
    return d1 > d2 ? [g[0], g[1]] : [g[2], g[3]];
  }

  // The drawing area: the plan plus a margin, with extra room below for the scale bar.
  function planBox(L) { return { x: L.x0 - 10, y: L.y0 - 10, w: L.w + 20, h: L.h + 30 }; }
  const ftIn = inches => { const r = Math.round(inches); return Math.floor(r / 12) + "′" + (r % 12) + "″"; };
  // Where the desk chair sits: pulled out from the desk on the side away from the wall, 19" square.
  // The desk's drawer pedestal sits at its right (or lower) end, or the other end when the plan says so;
  // the rest is knee space.
  function deskPedestal(L, d) {
    const along = d.w >= d.h, ped = Math.min(16 * L.U, (along ? d.w : d.h) * 0.4), st = d.pedStart;
    return { along, ped, start: st, r: along ? { x: st ? d.x : d.x + d.w - ped, y: d.y, w: ped, h: d.h } : { x: d.x, y: st ? d.y : d.y + d.h - ped, w: d.w, h: ped } };
  }
  // Desk lamp: in the back corner, or the front corner over the drawers when monitors fill the back.
  function lampSpot(L, d, monitors) {
    const e = 5 * L.U, ws = d.wall;
    if (!monitors) return { x: ws === "r" ? d.x + d.w - e : d.x + e, y: ws === "b" ? d.y + d.h - e : d.y + e };
    if (d.w >= d.h) return { x: d.x + d.w - e, y: ws === "t" ? d.y + d.h - e : d.y + e };
    return { x: ws === "l" ? d.x + d.w - e : d.x + e, y: d.y + d.h - e };
  }
  // The desk chair, centered in the knee space so it never runs into the drawers.
  function chairSpot(L, d) {
    const s = 19 * L.U, ws = d.wall, pd = deskPedestal(L, d);
    const off = pd.start ? pd.ped : 0;
    let x = pd.along ? d.x + off + (d.w - pd.ped) / 2 : d.x + d.w / 2, y = pd.along ? d.y + d.h / 2 : d.y + off + (d.h - pd.ped) / 2;
    if (ws === "t") y = d.y + d.h + s / 2 - 2 * L.U;
    if (ws === "b") y = d.y - s / 2 + 2 * L.U;
    if (ws === "l") x = d.x + d.w + s / 2 - 2 * L.U;
    if (ws === "r") x = d.x - s / 2 + 2 * L.U;
    return { x, y, s };
  }
  // Storage doors on the plan: swing arcs for wardrobe doors, a sliding track for wide closets.
  function storageDoors2D(g, f, IN) {
    const fs = f.front, along = fs === "t" || fs === "b";
    const p0 = fs === "t" ? [f.x, f.y] : fs === "b" ? [f.x, f.y + f.h] : fs === "l" ? [f.x, f.y] : [f.x + f.w, f.y];
    const p1 = along ? [p0[0] + f.w, p0[1]] : [p0[0], p0[1] + f.h];
    const n = { t: [0, -1], b: [0, 1], l: [-1, 0], r: [1, 0] }[fs], len = along ? f.w : f.h;
    if (f.t === "closet" && len > IN(60)) {
      const off = IN(2.5), q0 = [p0[0] - n[0] * off, p0[1] - n[1] * off], q1 = [p1[0] - n[0] * off, p1[1] - n[1] * off];
      el("line", { x1: q0[0], y1: q0[1], x2: q1[0], y2: q1[1], class: "p-swing2" }, g);
      return;
    }
    if (f.t === "closet" && len >= IN(36)) {
      // bi-fold: each half folds out from its jamb in two leaves
      const a = len / 4, u = [(p1[0] - p0[0]) / len, (p1[1] - p0[1]) / len];
      [[p0, u], [p1, [-u[0], -u[1]]]].forEach(([hp, v]) => {
        const mid = [hp[0] + v[0] * a / 2 + n[0] * a * 0.87, hp[1] + v[1] * a / 2 + n[1] * a * 0.87], end = [hp[0] + v[0] * a, hp[1] + v[1] * a];
        el("path", { d: "M" + hp[0] + " " + hp[1] + " L" + mid[0] + " " + mid[1] + " L" + end[0] + " " + end[1], class: "p-swing2" }, g);
      });
      return;
    }
    const doors = f.t === "dresser" ? 0 : f.t === "pantry" ? 1 : 2, half = len / doors;
    [[p0, [(p1[0] - p0[0]) / len, (p1[1] - p0[1]) / len]], [p1, [(p0[0] - p1[0]) / len, (p0[1] - p1[1]) / len]]].slice(0, doors).forEach(([hp, u]) => {
      const a = [hp[0] + u[0] * half, hp[1] + u[1] * half], e = [hp[0] + n[0] * half, hp[1] + n[1] * half];
      const sweep = u[0] * n[1] - u[1] * n[0] > 0 ? 1 : 0;
      el("path", { d: "M" + hp[0] + " " + hp[1] + " L" + e[0] + " " + e[1] + " M" + a[0] + " " + a[1] + " A" + half + " " + half + " 0 0 " + sweep + " " + e[0] + " " + e[1], class: "p-swing2" }, g);
    });
  }
  // Walker's under-bed storage: two two-drawer units under the deck, opening on the bed's open side.
  function bedDrawers(L, b) {
    const horiz = b.head === "l" || b.head === "r", s1 = horiz ? "t" : "l", s2 = horiz ? "b" : "r";
    const open = wallGap(L, b, s1) >= wallGap(L, b, s2) ? s1 : s2;
    const run = inset(band(b, open, 18 * L.U), L.U), len = horiz ? run.w : run.h;
    const unit = Math.min(30 * L.U, (len - 4 * L.U) / 2), gap = 2 * L.U, start = (len - 2 * unit - gap) / 2;
    return { open, units: [0, 1].map(k => (horiz ? { x: run.x + start + k * (unit + gap), y: run.y, w: unit, h: run.h }
      : { x: run.x, y: run.y + start + k * (unit + gap), w: run.w, h: unit })) };
  }
  function baseFloor(L) { return /^carpet/.test(L.floorBase || "") ? "carpet" : L.floorBase; }

  /* ---------- Plan renderer ---------- */
  function renderPlan(svg, key, opt) {
    const L = LAYOUTS[key];
    const pal = PALETTES[opt.palette];
    const lvl = opt.designed ? PACKAGES[opt.pkg].level : 0;
    const { bedOn, roomOn, winOn } = ownership(L, opt, lvl);
    const id = svg.id;
    const IN = v => v * L.U;
    const vb = planBox(L);
    svg.innerHTML = "";
    svg.setAttribute("viewBox", vb.x + " " + vb.y + " " + vb.w + " " + vb.h);

    const defs = el("defs", {}, svg);
    const grid = el("pattern", { id: id + "-grid", width: 16, height: 16, patternUnits: "userSpaceOnUse" }, defs);
    el("path", { d: "M16 0 H0 V16", class: "p-gridline" }, grid);
    const wp = el("pattern", { id: id + "-wp", width: 8, height: 8, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
    el("rect", { width: 8, height: 8, fill: pal.light }, wp);
    el("rect", { width: 3, height: 8, fill: pal.bed }, wp);
    const glow = el("filter", { id: id + "-glow", x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs);
    el("feGaussianBlur", { stdDeviation: 2.4, result: "b" }, glow);
    const merge = el("feMerge", {}, glow);
    el("feMergeNode", { in: "b" }, merge);
    el("feMergeNode", { in: "SourceGraphic" }, merge);
    const lampG = el("radialGradient", { id: id + "-lamp" }, defs);
    el("stop", { offset: "0", "stop-color": "#FFD45E", "stop-opacity": ".75" }, lampG);
    el("stop", { offset: "1", "stop-color": "#FFD45E", "stop-opacity": "0" }, lampG);

    const pts = L.outline.map(p => p.join(",")).join(" ");
    el("polygon", { points: pts, class: "p-floor" }, svg);
    if (L.floors) {
      const carpet = el("pattern", { id: id + "-carpet", width: 5, height: 5, patternUnits: "userSpaceOnUse" }, defs);
      el("circle", { cx: 1.2, cy: 1.2, r: .5, class: "p-carpet" }, carpet);
      el("circle", { cx: 3.7, cy: 3.7, r: .5, class: "p-carpet" }, carpet);
      const grid = (name, size) => {
        const pat = el("pattern", { id: id + "-" + name, width: size, height: size, patternUnits: "userSpaceOnUse" }, defs);
        el("rect", { width: size, height: size, class: "p-tile" }, pat);
        el("path", { d: "M" + size + " 0 H0 V" + size, class: "p-tileline" }, pat);
      };
      grid("tile", IN(12));
      grid("vinyl", IN(16));
      const pw = IN(48), ph = IN(6);
      const wood = el("pattern", { id: id + "-wood", width: pw, height: ph * 2, patternUnits: "userSpaceOnUse" }, defs);
      el("rect", { width: pw, height: ph * 2, class: "p-wood" }, wood);
      el("path", { d: "M0 " + ph + " H" + pw + " M0 " + ph * 2 + " H" + pw + " M0 0 V" + ph + " M" + pw / 2 + " " + ph + " V" + ph * 2, class: "p-woodline" }, wood);
      el("polygon", { points: pts, fill: "url(#" + id + "-" + baseFloor(L) + ")" }, svg);
      L.floors.forEach(f => el("polygon", { points: f.poly.map(p => p.join(",")).join(" "), fill: "url(#" + id + "-" + f.type + ")" }, svg));
    } else {
      el("polygon", { points: pts, fill: "url(#" + id + "-grid)" }, svg);
    }

    const under = el("g", { class: "decor" }, svg);
    const furnG = el("g", {}, svg);
    const wallsG = el("g", {}, svg);
    const over = el("g", { class: "decor" }, svg);
    const labelsG = el("g", {}, svg);

    // Rugs and wallpaper sit under the furniture.
    if (lvl >= 3) {
      decorSets(L, bedOn, roomOn).forEach(r => {
        if (!r.rug) return;
        const [x, y, w, h] = r.rug;
        const g = el("g", {}, under);
        rect(g, { x, y, w, h }, { rx: 6, fill: pal.light, stroke: pal.accent, "stroke-width": 1.2 });
        rect(g, inset({ x, y, w, h }, 5), { rx: 3, fill: "none", stroke: pal.accent, "stroke-width": .7, "stroke-dasharray": "3 2.5" });
      });
      L.beds.forEach((b, i) => {
        if (!bedOn[i] || !b.art) return;
        const [x1, y1, x2, y2, nx, ny] = b.art;
        const g = el("g", {}, under);
        if (y1 === y2) rect(g, { x: Math.min(x1, x2), y: ny > 0 ? y1 + 1.5 : y1 - 15.5, w: Math.abs(x2 - x1), h: 14 }, { fill: "url(#" + id + "-wp)", opacity: .9 });
        else rect(g, { x: nx > 0 ? x1 + 1.5 : x1 - 15.5, y: Math.min(y1, y2), w: 14, h: Math.abs(y2 - y1) }, { fill: "url(#" + id + "-wp)", opacity: .9 });
      });
    }

    // Furniture and fixtures from the drawing.
    L.furn.forEach(f => {
      const t = f.t;
      if (t === "toilet") {
        rect(furnG, f.tank, { rx: 1, class: "p-fix" });
        el("ellipse", { cx: f.cx, cy: f.cy, rx: f.rx, ry: f.ry, class: "p-fix" }, furnG);
        return;
      }
      if (t === "round" || t === "heater") {
        el("circle", { cx: f.cx, cy: f.cy, r: f.r, class: t === "heater" ? "p-fix" : "p-furn" }, furnG);
        if (t === "heater") el("circle", { cx: f.cx, cy: f.cy, r: f.r * .55, class: "p-fixline" }, furnG);
        return;
      }
      const g = f.rot ? el("g", { transform: "rotate(" + f.rot + " " + (f.x + f.w / 2) + " " + (f.y + f.h / 2) + ")" }, furnG) : furnG;
      const { x, y, w, h } = f;
      if (t === "shower" || t === "utility") {
        rect(g, f, { class: "p-fix" });
        el("path", { d: "M" + x + " " + y + " L" + (x + w) + " " + (y + h) + " M" + (x + w) + " " + y + " L" + x + " " + (y + h), class: "p-fixline" }, g);
      } else if (t === "tub") {
        rect(g, f, { class: "p-fix" });
        rect(g, inset(f, Math.min(w, h) * .12), { rx: Math.min(w, h) * .3, class: "p-fixline" });
      } else if (t === "sink" || t === "ksink") {
        rect(g, f, { class: "p-fix" });
        if (t === "sink") el("ellipse", { cx: x + w / 2, cy: y + h / 2, rx: Math.min(w, h) * .32, ry: Math.min(w, h) * .38, class: "p-fixline" }, g);
        else rect(g, inset(f, 4), { rx: 2, class: "p-fixline" });
      } else if (t === "range") {
        rect(g, f, { class: "p-fix" });
        [[.3, .3], [.7, .3], [.3, .7], [.7, .7]].forEach(([u, v]) => el("circle", { cx: x + w * u, cy: y + h * v, r: Math.min(w, h) * .14, class: "p-fixline" }, g));
      } else if (t === "endround") {
        rect(g, f, { class: "p-furn" });
        el("circle", { cx: x + w / 2, cy: y + h / 2, r: Math.min(w, h) * .38, class: "p-fixline" }, g);
      } else if (t === "appl" || t === "washer" || t === "dryer" || t === "cabinet") {
        rect(g, f, { class: "p-fix" });
        rectLabel(g, x, y, w, h, f.label || FURN_LABEL[t]);
      } else {
        rect(g, f, { class: "p-furn", rx: SEATS[t] ? 3 : 0 });
        if (SEATS[t] && f.back) rect(g, band(f, f.back, f.dining ? IN(3) : Math.min(IN(8), Math.min(w, h) * .3)), { class: "p-seatback" });
        if (STORAGE[t] && f.front) storageDoors2D(g, f, IN);
        rectLabel(g, x, y, w, h, f.label || FURN_LABEL[t]);
      }
    });
    L.desks.forEach((d, i) => {
      rect(furnG, d, { class: "p-furn" });
      if (!bedOn[i]) rectLabel(furnG, d.x, d.y, d.w, d.h, "Desk");
      if (!(bedOn[i] && lvl >= 3)) { const c = chairSpot(L, d); rect(furnG, { x: c.x - c.s / 2, y: c.y - c.s / 2, w: c.s, h: c.s }, { rx: c.s * .25, class: "p-chair" }); }
    });
    L.beds.forEach((b, i) => {
      rect(furnG, b, { class: "p-furn" });
      if (!bedOn[i]) rectLabel(furnG, b.x, b.y, b.w, b.h, "Bed");
      if (L.underBedDrawers) bedDrawers(L, b).units.forEach(u => rect(furnG, u, { class: "p-swing2" }));
    });

    // Walls, windows, doors.
    if (L.shell) el("polyline", { points: L.shell.map(p => p.join(",")).join(" "), class: "p-shell" }, wallsG);
    el("polygon", { points: pts, class: "p-wall", style: "stroke-width:" + L.wallT }, wallsG);
    L.walls.forEach(w => {
      const line = el("line", { x1: w[0], y1: w[1], x2: w[2], y2: w[3], class: "p-iwall" }, wallsG);
      if (w[4]) line.setAttribute("style", "stroke-width:" + w[4]);
    });
    L.windows.forEach((w, wi) => {
      const [x1, y1, x2, y2] = w;
      el("line", { x1, y1, x2, y2, class: "p-wingap", style: "stroke-width:" + (L.wallT + 1.4) }, wallsG);
      const horiz = y1 === y2;
      [-1.6, 1.6].forEach(o => el("line", horiz ? { x1, y1: y1 + o, x2, y2: y2 + o, class: "p-win" } : { x1: x1 + o, y1, x2: x2 + o, y2, class: "p-win" }, wallsG));
      if (lvl >= 2 && winOn[wi]) el("line", { x1, y1, x2, y2, stroke: pal.deep, "stroke-width": 2.6, "stroke-linecap": "round", class: "blinds" }, over);
    });
    L.doors.forEach(d => {
      if (d.gap) el("line", { x1: d.gap[0], y1: d.gap[1], x2: d.gap[2], y2: d.gap[3], class: "p-gap", style: "stroke-width:" + (L.wallT + 2) }, wallsG);
      if (!d.leaf) return;
      const [hx, hy, ex, ey] = d.leaf;
      el("line", { x1: hx, y1: hy, x2: ex, y2: ey, class: "p-leaf" }, wallsG);
      const far = d.arc && doorFar(d);
      if (far) {
        const r = Math.hypot(ex - hx, ey - hy);
        const cross = (ex - hx) * (far[1] - hy) - (ey - hy) * (far[0] - hx);
        el("path", { d: "M" + ex + " " + ey + " A" + r + " " + r + " 0 0 " + (cross > 0 ? 1 : 0) + " " + far[0] + " " + far[1], class: "p-arc" }, wallsG);
      }
    });

    // Decor on top.
    if (lvl >= 1) {
      L.beds.forEach((b, i) => {
        if (!bedOn[i]) return;
        const g = el("g", {}, over);
        const horiz = b.head === "l" || b.head === "r";
        const length = horiz ? b.w : b.h;
        rect(g, inset(b, 1.2), { rx: 3, fill: pal.bed, stroke: pal.accent, "stroke-width": .8 });
        // under-bed storage, drawn dashed (hidden-line convention)
        const c = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
        const bw = horiz ? 20 : b.w * .55, bh = horiz ? b.h * .55 : 20;
        [-1, 1].forEach(sgn => {
          const off = sgn * 13;
          rect(g, { x: c.x - bw / 2 + (horiz ? off : 0), y: c.y - bh / 2 + (horiz ? 0 : off), w: bw, h: bh }, { fill: "none", stroke: pal.deep, "stroke-width": .7, "stroke-dasharray": "2 2", opacity: .7 });
        });
        if (lvl >= 2) rect(g, inset(b, 4), { rx: 3, fill: "none", stroke: pal.accent, "stroke-width": .9, "stroke-dasharray": "4 2" });
        if (lvl >= 3) {
          const foot = band(inset(b, 1.2), OPP[b.head], length * .26);
          rect(g, foot, { rx: 2, fill: pal.accent, opacity: .9 });
        }
        const pil = inset(band(b, b.head, Math.min(18, length * .17) + 4), 4);
        rect(g, pil, { rx: 4, fill: pal.light, stroke: pal.deep, "stroke-width": .8 });
        if (lvl >= 3) {
          const cx = pil.x + pil.w / 2, cy = pil.y + pil.h / 2;
          const dx = horiz ? 0 : pil.w * .22, dy = horiz ? pil.h * .22 : 0;
          el("circle", { cx: cx - dx, cy: cy - dy, r: 3.6, fill: pal.deep }, g);
          el("circle", { cx: cx + dx, cy: cy + dy, r: 3.6, fill: pal.accent }, g);
        }
        // posters & neon along the wall run
        if (lvl >= 2 && b.art) {
          const [x1, y1, x2, y2, nx, ny] = b.art;
          const horizWall = y1 === y2;
          const runLen = Math.abs(horizWall ? x2 - x1 : y2 - y1);
          const pl = IN(POSTER.w), lo = horizWall ? Math.min(x1, x2) : Math.min(y1, y2);
          const colors = [pal.accent, pal.deep, pal.bed, pal.accent, pal.deep];
          posterGrid(runLen / L.U, lvl >= 3 ? 5 : 3).forEach((ps, k) => {
            const along = lo + IN(ps.along);
            const r = horizWall
              ? { x: along - pl / 2, y: ny > 0 ? y1 + 2.4 : y1 - 7.4, w: pl, h: 5 }
              : { x: nx > 0 ? x1 + 2.4 : x1 - 7.4, y: along - pl / 2, w: 5, h: pl };
            rect(g, r, { fill: colors[k], stroke: "#FFFFFF", "stroke-width": .6 });
          });
          if (lvl >= 3) {
            const o = 10;
            const lp = horizWall
              ? { x1: Math.min(x1, x2) + 3, y1: y1 + ny * o, x2: Math.max(x1, x2) - 3, y2: y1 + ny * o }
              : { x1: x1 + nx * o, y1: Math.min(y1, y2) + 3, x2: x1 + nx * o, y2: Math.max(y1, y2) - 3 };
            el("line", Object.assign(lp, { stroke: pal.accent, "stroke-width": 2, "stroke-linecap": "round", filter: "url(#" + id + "-glow)" }), g);
          }
        }
      });

      L.desks.forEach((d, i) => {
        if (!bedOn[i]) return;
        const g = el("g", {}, over);
        const wallSide = d.wall;
        if (lvl >= 2) {
          // lamp in the desk corner nearest the wall
          const lp = lampSpot(L, d, opt.major === "eng"), lx = lp.x, ly = lp.y;
          el("circle", { cx: lx, cy: ly, r: 13, fill: "url(#" + id + "-lamp)" }, g);
          el("circle", { cx: lx, cy: ly, r: 3.4, fill: "#FFC83A", stroke: pal.deep, "stroke-width": .8 }, g);
        }
        if (opt.major === "eng") {
          const mon = band(inset(d, 3), wallSide, 3.2);
          const vertical = wallSide === "l" || wallSide === "r";
          const span = vertical ? mon.h : mon.w;
          const seg = span * .44;
          [0, 1].forEach(k => {
            const r = vertical ? { x: mon.x, y: mon.y + k * (span - seg), w: mon.w, h: seg } : { x: mon.x + k * (span - seg), y: mon.y, w: seg, h: mon.h };
            rect(g, r, { fill: pal.deep, rx: 1 });
          });
          rect(g, inset(d, 6), { fill: "none", stroke: pal.accent, "stroke-width": .9, rx: 2 });
        }
        if (lvl >= 3) {
          // upgraded chair, pulled out from the desk
          const c = chairSpot(L, d);
          rect(g, { x: c.x - c.s / 2, y: c.y - c.s / 2, w: c.s, h: c.s }, { rx: c.s * .25, fill: pal.deep, stroke: pal.light, "stroke-width": 1 });
        }
      });

      decorSets(L, bedOn, roomOn).forEach(r => {
        if (lvl >= 3 && r.fridge) {
          const g = el("g", {}, over);
          const [x, y] = r.fridge;
          rect(g, { x: x - IN(9.5), y: y - IN(9.5), w: IN(19), h: IN(19) }, { rx: 2, class: "p-appl", stroke: pal.deep });
          text(g, x, y, "FRIDGE", "p-appl-label");
        }
        if (lvl >= 3 && r.bean) {
          const g = el("g", {}, over);
          const [x, y] = r.bean;
          const br = ((r.beanD || 32) - 2) / 30;
          el("circle", { cx: x, cy: y, r: IN(15 * br), fill: pal.accent }, g);
          el("circle", { cx: x - IN(4 * br), cy: y - IN(4 * br), r: IN(6 * br), fill: "#FFFFFF", opacity: .28 }, g);
        }
        if (r.extra && (opt.major === "art" || opt.major === "music")) {
          // Local frame: +y points into the room, away from the wall the add-on stands against.
          const [x, y] = r.extra, f = facingOf(r), ang = Math.atan2(-f[0], f[1]) * 180 / Math.PI;
          const g = el("g", { transform: "translate(" + x + " " + y + ") rotate(" + ang + ")" }, el("g", {}, over));   // inner group: the pop-in animation owns the outer one's transform
          if (opt.major === "art") {
            const e = L.U;   // easel seen from above: rear leg to the wall, two front legs splayed, canvas at the front
            el("path", { d: "M" + (-11 * e) + " " + (7 * e) + " L0 " + (-1 * e) + " L" + (11 * e) + " " + (7 * e) + " M0 " + (-1 * e) + " L0 " + (-9 * e), stroke: pal.deep, "stroke-width": 1.6, fill: "none", "stroke-linecap": "round" }, g);
            rect(g, { x: -9 * e, y: 2 * e, w: 18 * e, h: 2.5 * e }, { fill: "#FFFFFF", stroke: pal.accent, "stroke-width": 1.2 });
          } else {
            const kw = IN(Math.min(36, (r.extraW || 38) - 2)), kh = IN(12);
            rect(g, { x: -kw / 2, y: -kh / 2, w: kw, h: kh }, { fill: "#FFFFFF", stroke: pal.deep, "stroke-width": 1.1, rx: 1 });
            for (let k = 1; k < 14; k++) if (k % 7 !== 3 && k % 7 !== 0) el("line", { x1: -kw / 2 + k * kw / 14, y1: -kh / 2, x2: -kw / 2 + k * kw / 14, y2: 0, stroke: pal.deep, "stroke-width": 1.2 }, g);
          }
        }
      });
    }

    L.labels.forEach(l => {
      if (!l[2]) return;
      text(labelsG, l[0], l[1], l[2], "p-room");
      if (l[3]) text(labelsG, l[0], l[1] + 11, l[3], "p-dim");
    });

    if (opt.focusRoom != null && L.rooms[opt.focusRoom]) {
      const rb = roomBox(L, opt.focusRoom), pad = 6 * L.U, vb2 = planBox(L);
      const hole = [rb.x - pad, rb.y - pad, rb.w + 2 * pad, rb.h + 2 * pad];
      el("path", { d: "M" + vb2.x + " " + vb2.y + "h" + vb2.w + "v" + vb2.h + "h" + (-vb2.w) + "Z M" + hole[0] + " " + hole[1] + "v" + hole[3] + "h" + hole[2] + "v" + (-hole[3]) + "Z",
        class: "p-focusmask", "fill-rule": "evenodd" }, labelsG);
      rect(labelsG, { x: hole[0], y: hole[1], w: hole[2], h: hole[3] }, { rx: 6, class: "p-focusring" });
    }
    // 5-foot scale bar
    const sbY = L.y0 + L.h + 12, sbL = IN(60);
    el("path", { d: "M" + L.x0 + " " + (sbY - 3) + " V" + sbY + " H" + (L.x0 + sbL) + " V" + (sbY - 3) + " M" + (L.x0 + sbL / 5 * 1) + " " + sbY + " V" + (sbY - 1.5), class: "p-scale" }, labelsG);
    el("text", { x: L.x0 + sbL + 5, y: sbY, class: "p-dim", "dominant-baseline": "central" }, labelsG).textContent = "5 ft";
    el("text", { x: L.x0 + L.w, y: sbY, class: "p-dim", "text-anchor": "end", "dominant-baseline": "central" }, labelsG).textContent =
      "Overall " + ftIn(L.real.w) + " × " + ftIn(L.real.h);

    if (opt.you != null && L.beds[opt.you]) {
      const b = L.beds[opt.you];
      rect(labelsG, inset(b, -3), { rx: 5, class: "p-you" });
      text(labelsG, b.x + b.w / 2, b.y + b.h / 2, "YOU", "p-youlabel");
    }
    if (opt.onBed) L.beds.forEach((b, i) => {
      const hit = rect(labelsG, b, { class: "p-hit", "aria-hidden": "true" });
      const t = el("title", {}, hit);
      t.textContent = "Make bed " + L.bedNames[i] + " yours";
      hit.addEventListener("click", () => opt.onBed(i));
    });
  }

  /* Which beds, rooms and windows get decor. A shared room (lounge, kitchen)
     is decorated only when every bed in the suite is on the order. */
  function nearestBed(L, x, y) {
    let best = 0, bd = Infinity;
    L.beds.forEach((b, i) => { const d = Math.hypot(b.x + b.w / 2 - x, b.y + b.h / 2 - y); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  function ownership(L, opt, lvl) {
    const owned = i => !opt.owned || opt.owned.indexOf(i) >= 0;
    const bedOn = L.beds.map((b, i) => lvl > 0 && owned(i));
    const roomOn = L.rooms.map((r, ri) => {
      const beds = L.bedRoom.map((r2, i) => (r2 === ri ? i : -1)).filter(i => i >= 0);
      return lvl > 0 && (beds.length ? beds.some(i => bedOn[i]) : bedOn.every(Boolean));
    });
    // Blinds go on a window only when it's inside a bedroom on the order; never in a lounge, kitchen or living room.
    const winOn = L.windows.map(w => {
      const mx = (w[0] + w[2]) / 2, my = (w[1] + w[3]) / 2, pad = 18 * L.U;
      return L.rooms.some((r, ri) => {
        if (!roomOn[ri] || L.bedRoom.indexOf(ri) < 0) return false;
        const rb = roomBox(L, ri);
        return mx >= rb.x - pad && mx <= rb.x + rb.w + pad && my >= rb.y - pad && my <= rb.y + rb.h + pad;
      });
    });
    return { bedOn, roomOn, winOn };
  }

  /* ---------- 3D view (three.js, loaded the first time someone opens it) ---------- */
  const THREE_URL = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  const C3 = { wall: "#EEEAE2", ink: "#77716A", floor: "#D9D3E0", wood: "#D8B676", woodDark: "#B48F55", door: "#7A4E32",
    furn: "#9C95B2", fix: "#FAFAFC", glass: "#BFD9EE", mattress: "#F4F2F7", screen: "#1D1730", metal: "#3A3448", water: "#D7E6F0" };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let three = null, threeLoading = null;

  function loadThree() {
    if (window.THREE) return Promise.resolve();
    if (!threeLoading) {
      threeLoading = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = THREE_URL;
        s.onload = resolve;
        s.onerror = () => { threeLoading = null; reject(new Error("three.js failed to load")); };
        document.head.appendChild(s);
      });
    }
    return threeLoading;
  }

  function open3D() {
    state.view = "3d";
    update();
    if (three) return;
    const msg = document.getElementById("v3msg");
    msg.hidden = false;
    msg.textContent = "Building the 3D room…";
    loadThree().then(() => {
      if (!init3D()) throw new Error("WebGL unavailable");
      msg.hidden = true;
      update();
    }).catch(() => {
      msg.textContent = "The 3D view couldn't start in this browser. The 2D plan still works.";
    });
  }

  function init3D() {
    const host = document.getElementById("stage3d"), canvas = document.getElementById("c3d");
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); } catch (e) { return false; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.86;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 1, 8000);
    scene.add(new THREE.HemisphereLight(0xfff8ec, 0xa9b4c0, 0.48));
    const sun = new THREE.DirectionalLight(0xffefd8, 0.85);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0003;
    sun.shadow.normalBias = 0.6;
    sun.shadow.radius = 4;
    const fill = new THREE.DirectionalLight(0xc6dfff, 0.22);
    fill.position.set(-300, 240, -180);
    scene.add(fill);
    scene.add(sun, sun.target);
    three = { renderer, scene, camera, sun, group: null, geos: [], mats: [], L: null, mode: "rotate",
      orbit: { theta: 0.45, phi: 0.92, r: 700, tx: 0, tz: 0 }, R: 700, aspect: 0.7, queued: false, tween: 0 };

    // Left drag rotates (or moves, in Move mode); right drag, shift drag and two fingers move; pinch zooms.
    const pts = new Map();
    let pinch = null, panning = false;
    const pair = () => Array.from(pts.values());
    const spread = () => { const a = pair(); return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) || 1; };
    const mid = () => { const a = pair(); return { x: (a[0].x + a[1].x) / 2, y: (a[0].y + a[1].y) / 2 }; };
    canvas.addEventListener("contextmenu", e => e.preventDefault());
    canvas.addEventListener("pointerdown", e => {
      canvas.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      panning = three.mode === "move" || e.button === 2 || e.shiftKey;
      if (pts.size === 2) pinch = { d: spread(), r: three.orbit.r, m: mid() };
      three.tween++;
      canvas.classList.add("grabbing");
    });
    canvas.addEventListener("pointermove", e => {
      const p = pts.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;
      const o = three.orbit;
      if (pts.size === 1) {
        if (panning) pan3D(dx, dy);
        else { o.theta -= dx * 0.008; o.phi = clamp(o.phi - dy * 0.006, 0.18, 1.42); }
      } else if (pinch) {
        o.r = clamp(pinch.r * pinch.d / spread(), three.R * 0.12, three.R * 2.2);
        const m = mid();
        pan3D(m.x - pinch.m.x, m.y - pinch.m.y);
        pinch.m = m;
      }
      render3D();
    });
    const release = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) canvas.classList.remove("grabbing"); };
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);
    // Trackpad pinch arrives as ctrl+wheel; plain scrolling keeps scrolling the page.
    canvas.addEventListener("wheel", e => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); zoom3D(1 + e.deltaY * 0.01); }, { passive: false });
    canvas.addEventListener("keydown", e => {
      const o = three.orbit, move = three.mode === "move" || e.shiftKey;
      switch (e.key) {
        case "ArrowLeft": move ? pan3D(30, 0) : (o.theta += 0.12); break;
        case "ArrowRight": move ? pan3D(-30, 0) : (o.theta -= 0.12); break;
        case "ArrowUp": move ? pan3D(0, 30) : (o.phi = clamp(o.phi - 0.08, 0.18, 1.42)); break;
        case "ArrowDown": move ? pan3D(0, -30) : (o.phi = clamp(o.phi + 0.08, 0.18, 1.42)); break;
        case "+": case "=": zoom3D(0.85); break;
        case "-": zoom3D(1.18); break;
        default: return;
      }
      e.preventDefault();
      render3D();
    });
    if (window.ResizeObserver) new ResizeObserver(size3D).observe(host);
    else window.addEventListener("resize", size3D);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", render3D);
    return true;
  }

  function zoom3D(f) { three.tween++; three.orbit.r = clamp(three.orbit.r * f, three.R * 0.12, three.R * 2.2); render3D(); }
  // Slide the look-at point across the floor so the scene follows the pointer.
  function pan3D(dx, dy) {
    const o = three.orbit, L = three.L, k = o.r * 0.0016;
    const rx = Math.cos(o.theta), rz = -Math.sin(o.theta), fx = -Math.sin(o.theta), fz = -Math.cos(o.theta);
    o.tx = clamp(o.tx - rx * dx * k + fx * dy * k, -L.w / 2, L.w / 2);
    o.tz = clamp(o.tz - rz * dx * k + fz * dy * k, -L.h / 2, L.h / 2);
    render3D();
  }
  // Frame a plan box (or the whole plan when box is null), easing there unless motion is reduced.
  function focus3D(box, animate) {
    const L = three.L, span = 2 * 0.344, camAspect = 1 / three.aspect;
    const w = box ? box.w : L.w, h = box ? box.h : L.h;
    const to = {
      theta: three.orbit.theta, phi: state.walls === "low" ? (box ? 0.82 : 0.92) : (box ? 0.62 : 0.78),
      r: box ? Math.max(2.1 * w / (span * camAspect), 2.1 * h / span, 170) : Math.max(1.55 * w / (span * camAspect), 1.5 * h / span),
      tx: box ? box.x + box.w / 2 - L.cx : 0, tz: box ? box.y + box.h / 2 - L.cy : 0
    };
    const id = ++three.tween;
    if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { Object.assign(three.orbit, to); render3D(); return; }
    const from = Object.assign({}, three.orbit), t0 = performance.now();
    const step = now => {
      if (id !== three.tween) return;
      const t = Math.min(1, (now - t0) / 480), e = 1 - Math.pow(1 - t, 3);
      Object.keys(to).forEach(k => { three.orbit[k] = from[k] + (to[k] - from[k]) * e; });
      render3D();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function resetOrbit() { three.orbit.theta = 0.45; focus3D(null, false); }
  function size3D() {
    if (!three) return;
    const canvas = three.renderer.domElement, w = canvas.parentElement.clientWidth;
    if (!w) return;
    const h = Math.round(clamp(w * three.aspect, 280, 620));
    three.renderer.setSize(w, h, false);
    canvas.style.height = h + "px";
    three.camera.aspect = w / h;
    three.camera.updateProjectionMatrix();
    render3D();
  }
  function render3D() {
    if (!three || three.queued) return;
    three.queued = true;
    requestAnimationFrame(() => {
      three.queued = false;
      const o = three.orbit, s = Math.sin(o.phi);
      three.camera.position.set(o.tx + o.r * s * Math.sin(o.theta), o.r * Math.cos(o.phi), o.tz + o.r * s * Math.cos(o.theta));
      three.camera.lookAt(o.tx, 14, o.tz);
      const bg = getComputedStyle(document.documentElement).getPropertyValue("--plan-bg").trim() || "#FFFFFF";
      three.renderer.setClearColor(bg);
      three.renderer.render(three.scene, three.camera);
    });
  }

  function build3D(key, opt, resetView) {
    const T = THREE, L = LAYOUTS[key], pal = PALETTES[opt.palette];
    const lvl = opt.designed ? PACKAGES[opt.pkg].level : 0;
    const { bedOn, roomOn, winOn } = ownership(L, opt, lvl);
    three.L = L;

    if (three.group) {
      three.scene.remove(three.group);
      three.geos.forEach(g => g.dispose());
      three.mats.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
    }
    const geos = three.geos = [], mats = three.mats = [], cache = new Map();
    const M = (color, o) => {
      const k = color + (o ? JSON.stringify(o) : "");
      if (!cache.has(k)) {
        const m = new T.MeshStandardMaterial(Object.assign({ color, roughness: 0.82, metalness: 0 }, o || {}));
        cache.set(k, m); mats.push(m);
      }
      return cache.get(k);
    };
    const g = new T.Group();
    g.position.set(-L.cx, 0, -L.cy);
    const mesh = (geo, mat, x, y, z, shadow) => {
      geos.push(geo);
      const m = new T.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = shadow !== false;
      m.receiveShadow = true;
      g.add(m);
      return m;
    };
    // Plan rect (x, z, w, d) raised from y0 by h.
    // Small edge radii catch highlights without changing the furniture footprint.
    const softenedBox = (w, h, d) => {
      w = Math.max(w, .2); h = Math.max(h, .2); d = Math.max(d, .2);
      const radius = Math.min(w, h, d) * .12;
      const sh = new T.Shape(), x = -w / 2 + radius, y = -h / 2 + radius;
      sh.moveTo(x, y); sh.lineTo(-x, y); sh.lineTo(-x, -y); sh.lineTo(x, -y); sh.closePath();
      const geo = new T.ExtrudeGeometry(sh, { depth: d - 2 * radius, bevelEnabled: true,
        bevelThickness: radius, bevelSize: radius, bevelSegments: 3, steps: 1, curveSegments: 3 });
      geo.translate(0, 0, -d / 2 + radius);
      return geo;
    };
    const box = (x, z, w, d, y0, h, mat, shadow) =>
      mesh(softenedBox(w, h, d), mat, x + w / 2, y0 + h / 2, z + d / 2, shadow);
    // A stuffed cushion has curved shoulders and a slightly uneven crown, rather than flat box faces.
    const cushionGeometry = (w,h,d) => {
      const geo = new T.SphereGeometry(1,24,16), pos=geo.attributes.position;
      const curve=v=>Math.sign(v)*Math.pow(Math.abs(v),.38);
      for(let i=0;i<pos.count;i++) {
        const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
        pos.setXYZ(i,curve(x)*w/2,curve(y)*h/2,curve(z)*d/2);
      }
      geo.computeVertexNormals();return geo;
    };
    const puff = (x,z,w,d,y,h,mat) => mesh(cushionGeometry(w,h,d),mat,x+w/2,y+h/2,z+d/2);
    const fbox = (f, y0, h, mat, shadow) => {
      const m = box(f.x, f.y, f.w, f.h, y0, h, mat, shadow);
      if (f.rot) m.rotation.y = -f.rot * Math.PI / 180;
      return m;
    };
    // A slab along any plan segment, t thick, from y0 to y1.
    const slab = (x1, z1, x2, z2, t, y0, y1, mat, shadow) => {
      const len = Math.hypot(x2 - x1, z2 - z1);
      if (len < 0.3) return null;
      const m = mesh(new T.BoxGeometry(len, y1 - y0, t), mat, (x1 + x2) / 2, (y0 + y1) / 2, (z1 + z2) / 2, shadow);
      m.rotation.y = Math.atan2(-(z2 - z1), x2 - x1);
      return m;
    };
    const cyl = (cx, cz, r, y0, h, mat) => mesh(new T.CylinderGeometry(r, r, h, 20), mat, cx, y0 + h / 2, cz);
    const texMat = (draw, rx, ry) => {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      draw(c.getContext("2d"));
      const t = new T.CanvasTexture(c);
      t.wrapS = t.wrapT = T.RepeatWrapping;
      t.repeat.set(rx || 1, ry || 1);
      t.encoding = T.sRGBEncoding;
      t.anisotropy = Math.min(8, three.renderer.capabilities.getMaxAnisotropy());
      const m = new T.MeshStandardMaterial({ map: t, roughness: 0.9 });
      mats.push(m);
      return m;
    };

    // Floor
    const shape = new T.Shape();
    L.outline.forEach((p, i) => (i ? shape.lineTo(p[0], -p[1]) : shape.moveTo(p[0], -p[1])));
    const fg = new T.ShapeGeometry(shape);
    geos.push(fg);
    // Flooring from the plans and UMBC's 360° tours: carpet, wood-look plank, tile and vinyl.
    let seed = 7;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const CARPETS = { carpet: ["#CDC6D4", "#BDB5C7", "#DAD4E0"], carpetGray: ["#B7B4BC", "#A6A3AC", "#C8C5CC"], carpetBrown: ["#9C8763", "#8A7655", "#AD9773"] };
    const floorTex = type => {
      if (CARPETS[type]) {
        const c = CARPETS[type];
        return texMat(ctx => {
          ctx.fillStyle = c[0]; ctx.fillRect(0, 0, 128, 128);
          for (let k = 0; k < 1400; k++) { ctx.fillStyle = rand() > 0.5 ? c[1] : c[2]; ctx.fillRect(rand() * 128, rand() * 128, 1.5, 1.5); }
        }, 1 / L.U / 24, 1 / L.U / 24);
      }
      if (type === "wood") {
        return texMat(ctx => {
          const tones = ["#B9773D", "#C4854A", "#AD6C35", "#C98E55"];
          for (let row = 0; row < 8; row++) {
            for (let col = -1; col < 2; col++) {
              ctx.fillStyle = tones[(row * 3 + col + 4) % 4];
              ctx.fillRect(col * 96 + (row % 2) * 48, row * 16, 96, 16);
            }
            ctx.fillStyle = "rgba(60,30,10,.35)"; ctx.fillRect(0, row * 16, 128, 1.2);
          }
        }, 1 / L.U / 48, 1 / L.U / 48);
      }
      const big = type === "vinyl";
      return texMat(ctx => {
        ctx.fillStyle = big ? "#E6DCCB" : "#EEECF1"; ctx.fillRect(0, 0, 128, 128);
        ctx.strokeStyle = big ? "#CBBDA5" : "#B4ADC0"; ctx.lineWidth = big ? 4 : 6; ctx.strokeRect(0, 0, 128, 128);
      }, 1 / L.U / (big ? 16 : 12), 1 / L.U / (big ? 16 : 12));
    };
    const floor = new T.Mesh(fg, L.floorBase ? floorTex(L.floorBase) : M(C3.floor));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.userData.floor = true;
    g.add(floor);
    (L.floors || []).forEach(f => {
      const sh = new T.Shape();
      f.poly.forEach((p, i) => (i ? sh.lineTo(p[0], -p[1]) : sh.moveTo(p[0], -p[1])));
      const geo = new T.ShapeGeometry(sh);
      geos.push(geo);
      const m = new T.Mesh(geo, floorTex(f.type));
      m.rotation.x = -Math.PI / 2;
      m.position.y = 0.25;
      m.receiveShadow = true;
      m.userData.floor = true;
      g.add(m);
    });

    // Everything below is sized in real inches (IN) using the scale measured for this plan.
    const IN = v => v * L.U;
    const WH = IN(state.walls === "low" ? 40 : 96);
    const posterY = Math.min(IN(56), WH - IN(16));


    // Walls, cut for door gaps and windows. The top face is dark like the ink on the plan.
    const wallMat = [M(C3.wall), M(C3.wall), M(C3.ink), M(C3.wall), M(C3.wall), M(C3.wall)];
    const segs = [];
    L.outline.forEach((p, i) => { const q = L.outline[(i + 1) % L.outline.length]; segs.push([p[0], p[1], q[0], q[1], IN(8), true]); });
    L.walls.forEach(w => segs.push([w[0], w[1], w[2], w[3], w[4] ? w[4] : IN(3.5), false]));
    const cuts = L.doors.filter(d => d.gap).map(d => ({ p: d.gap }))
      .concat(L.windows.map((w, wi) => ({ p: w, win: wi })));
    const glass = M(C3.glass, { transparent: true, opacity: 0.35, roughness: 0.1 });
    const sill = Math.min(IN(30), WH * 0.4), head = Math.min(IN(84), WH);
    segs.forEach(([x1, y1, x2, y2, t, outer]) => {
      const len = Math.hypot(x2 - x1, y2 - y1);
      if (len < 0.5) return;
      const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
      // An outside wall sits entirely outside the plan line, so furniture traced against the line meets its face.
      let sh = [0, 0];
      if (outer) {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, n = [-uy, ux];
        const into = insidePlan(L, { x: mx + n[0] * 2, y: my + n[1] * 2 });
        sh = into ? [-n[0] * t / 2, -n[1] * t / 2] : [n[0] * t / 2, n[1] * t / 2];
      }
      const along = (x, y) => (x - x1) * ux + (y - y1) * uy;
      const off = (x, y) => Math.abs((x - x1) * -uy + (y - y1) * ux);
      const at = s => [x1 + ux * s, y1 + uy * s];
      const piece = (a, b, lo, hi, mat) => {
        if (b - a < 0.3 || hi - lo < 0.3) return;
        const p = at(a), q = at(b);
        const w = slab(p[0] + sh[0], p[1] + sh[1], q[0] + sh[0], q[1] + sh[1], t, lo, hi, mat || wallMat);
        if (w) w.userData.wall = true;
      };
      const s0 = -t / 2, s1 = len + t / 2;
      const mine = cuts.map(c => {
        const [ax, ay, bx, by] = c.p;
        if (off(ax, ay) > 2.5 || off(bx, by) > 2.5) return null;
        const a = Math.max(s0, Math.min(along(ax, ay), along(bx, by))), b = Math.min(s1, Math.max(along(ax, ay), along(bx, by)));
        return b > a ? { a, b, win: c.win } : null;
      }).filter(Boolean).sort((p, q) => p.a - q.a);
      let cur = s0;
      mine.forEach(k => {
        piece(cur, Math.max(cur, k.a), 0, WH);
        if (k.win != null) {
          piece(k.a, k.b, 0, sill);
          piece(k.a, k.b, head, WH);
          const p = at(k.a), q = at(k.b);
          const gm = lvl >= 2 && winOn[k.win] ? M(pal.deep, { transparent: true, opacity: 0.92 }) : glass;
          slab(p[0] + sh[0], p[1] + sh[1], q[0] + sh[0], q[1] + sh[1], IN(1.5), sill, head, gm, false);
        } else if (WH > IN(80)) {
          piece(k.a, k.b, IN(80), WH);          // header over the door
        }
        cur = Math.max(cur, k.b);
      });
      piece(cur, s1, 0, WH);
    });
    L.doors.forEach(d => { if (d.leaf) slab(d.leaf[0], d.leaf[1], d.leaf[2], d.leaf[3], IN(1.75), 0, Math.min(IN(80), WH), M(C3.door, { transparent: true, opacity: 0.35, depthWrite: false }), false); });

    // Repeatable, locally generated material maps keep the preview self-contained.
    const grain = color => texMat(ctx => {
      ctx.fillStyle = color; ctx.fillRect(0,0,128,128);
      for (let i=0;i<100;i++) {
        const y=(i*37)%128;
        ctx.strokeStyle = i%3 ? "rgba(83,47,20,.10)" : "rgba(255,244,213,.22)";
        ctx.lineWidth=.4+(i%4)*.2; ctx.beginPath(); ctx.moveTo(0,y);
        ctx.bezierCurveTo(35,y+Math.sin(i)*3,85,y-Math.cos(i)*2,128,y+1);ctx.stroke();
      }
    }, 1, 2);
    const fabric = color => {
      const material = texMat(ctx => {
        ctx.fillStyle=color;ctx.fillRect(0,0,128,128);
        for(let i=0;i<128;i+=3) {
          ctx.fillStyle="rgba(255,255,255,.09)";ctx.fillRect(i,0,1,128);
          ctx.fillStyle="rgba(0,0,0,.055)";ctx.fillRect(0,i,128,1);
        }
      }, 3, 3);
      material.roughness=.96;return material;
    };
    const wood = grain(C3.wood), dark = grain(C3.woodDark), fix = M(C3.fix, { roughness:.28 }),
      water = M(C3.water, { roughness:.15 }), metal = M(C3.metal, { metalness:.65, roughness:.32 });
    const uph = fabric(L.upholstery || C3.furn);
    const bedding = fabric(pal.bed), linen = fabric(pal.light), throwFabric = fabric(pal.accent);
    const legs = (r, h, mat) => {
      const s = Math.min(IN(1.75), r.w / 4, r.h / 4);
      [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([u, v]) => box(r.x + u * (r.w - s), r.y + v * (r.h - s), s, s, 0, h, mat || wood));
    };
    // Seats are built around their own centre so a rotated chair turns as one piece. Their backs come from fitFurniture.
    const seat = (f, armH) => {
      const c = centerOf(f), sub = new T.Group();
      sub.position.set(c.x, 0, c.y);
      sub.rotation.y = -(f.rot || 0) * Math.PI / 180;
      g.add(sub);
      const put = (x, z, w, d, y0, h, mat, upholstered = false) => {
        const geo = upholstered ? cushionGeometry(w,h,d) : softenedBox(w, h, d);
        geos.push(geo);
        const m = new T.Mesh(geo, mat);
        m.position.set(x - c.x + w / 2, y0 + h / 2, z - c.y + d / 2);
        m.castShadow = true; m.receiveShadow = true;
        sub.add(m);
      };
      const r = { x: f.x, y: f.y, w: f.w, h: f.h }, back = f.back || "t", leg = IN(1.5);
      const fourLegs = (q, h) => [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([u, v]) => put(q.x + u * (q.w - leg), q.y + v * (q.h - leg), leg, leg, 0, h, wood));
      if (f.dining) {                                   // maple dining chair
        const q = inset(r, IN(0.5));
        fourLegs(q, IN(17));
        put(q.x, q.y, q.w, q.h, IN(17), IN(1.5), wood);
        const bk = band(q, back, IN(1.5));
        // Open slatted chair back, with separate uprights and a top rail.
        const vertical = back === "l" || back === "r";
        for(let k=0;k<4;k++) {
          const u=(k+.5)/4;
          put(vertical?bk.x:bk.x+bk.w*u-IN(.6), vertical?bk.y+bk.h*u-IN(.6):bk.y,
            vertical?bk.w:IN(1.2),vertical?IN(1.2):bk.h,IN(18.5),IN(13),wood);
        }
        put(bk.x,bk.y,bk.w,bk.h,IN(31.5),IN(2),wood);
        return;
      }
      const bd = Math.min(IN(8), Math.min(r.w, r.h) * 0.3);
      fourLegs(inset(r, IN(1)), IN(6));
      put(r.x, r.y, r.w, r.h, IN(6), IN(4), wood);                                 // maple frame
      const cush = inset(r, IN(2));
      const horizontal = back === "t" || back === "b";
      const count = f.t === "chair" ? 1 : Math.max(2,Math.round((horizontal?r.w:r.h)/IN(24)));
      const bk = band(r, back, bd);
      for(let n=0;n<count;n++) {
        const gap=IN(.6), span=(horizontal?cush.w:cush.h)/count;
        put(horizontal?cush.x+n*span+gap/2:cush.x,horizontal?cush.y:cush.y+n*span+gap/2,
          horizontal?span-gap:cush.w,horizontal?cush.h:span-gap,IN(10),IN(7),uph,true);
        const backSpan=(horizontal?bk.w:bk.h)/count;
        put(horizontal?bk.x+n*backSpan+gap/2:bk.x,horizontal?bk.y:bk.y+n*backSpan+gap/2,
          horizontal?backSpan-gap:bk.w,horizontal?bk.h:backSpan-gap,IN(17),IN(15),uph,true);
      }                            // back cushion
      const arms = back === "t" || back === "b" ? [band(r, "l", IN(3)), band(r, "r", IN(3))] : [band(r, "t", IN(3)), band(r, "b", IN(3))];
      arms.forEach(a => put(a.x, a.y, a.w, a.h, IN(6), armH, wood));               // wooden arms
    };
    // Wardrobes and closets: an open maple carcass with a shelf and hanging rod behind see-through doors.
    // Doors are a solid maple frame around a clear pane, so the shelf, rod and clothes inside show through.
    const doorGlass = M("#DCEBF5", { transparent: true, opacity: 0.22, roughness: 0.05, depthWrite: false });
    const CLOTHES = ["#6D7FA3", "#C9A66B", "#A65D5D", "#5E8C7A", "#8B7BA8", "#D8D2C4"];
    const storage = (f, H, doors) => {
      const fs = f.front || "t", t = IN(0.75), along = fs === "t" || fs === "b";
      // Walker Avenue's closets are built into the walls: painted drywall with white trim, not maple furniture.
      const built = L.builtInClosets && (f.t === "closet" || f.t === "pantry");
      const shell = built ? M(C3.wall) : wood, trim = built ? M("#F7F5F0", { roughness: 0.6 }) : wood, base = built ? M("#D9D4CB") : dark;
      // A built-in closet's shell is part of the wall, so it turns see-through with the walls in room view.
      const asWall = m => { if (m && built) m.userData.wall = true; return m; };
      const bk = band(f, OPP[fs], t);
      asWall(box(bk.x, bk.y, bk.w, bk.h, 0, H, shell));
      (along ? ["l", "r"] : ["t", "b"]).forEach(sd => { const q = band(f, sd, t); asWall(box(q.x, q.y, q.w, q.h, 0, H, shell)); });
      // built-in closets meet the ceiling, so their top reads like the walls; freestanding wardrobes get a maple top
      asWall(box(f.x, f.y, f.w, f.h, H - IN(1), IN(1), H >= WH - 0.5 ? [shell, shell, M(C3.ink), shell, shell, shell] : wood));
      box(f.x, f.y, f.w, f.h, 0, IN(3), base);
      const inner = inset(f, t);
      if (H > IN(66)) box(inner.x, inner.y, inner.w, inner.h, IN(64), IN(0.75), built ? trim : wood, false);
      const rod = along ? { x: f.x + t, y: f.y + f.h / 2 - IN(0.5), w: f.w - 2 * t, h: IN(1) } : { x: f.x + f.w / 2 - IN(0.5), y: f.y + t, w: IN(1), h: f.h - 2 * t };
      box(rod.x, rod.y, rod.w, rod.h, IN(60), IN(1), metal, false);
      // a few things hanging on the rod
      const span = along ? rod.w : rod.h, hangers = Math.max(2, Math.floor(span / IN(7)));
      for (let k = 0; k < hangers; k++) {
        if (k % 3 === 2) continue;
        const at = (k + 0.5) * span / hangers, gw = IN(2), gd = Math.min(IN(16), (along ? f.h : f.w) - 2 * t - IN(2)), mat = M(CLOTHES[k % CLOTHES.length]);
        if (along) box(rod.x + at - gw / 2, f.y + f.h / 2 - gd / 2, gw, gd, IN(28), IN(31), mat, false);
        else box(f.x + f.w / 2 - gd / 2, rod.y + at - gw / 2, gd, gw, IN(28), IN(31), mat, false);
      }
      const front = band(f, fs, t), len = along ? front.w : front.h, n = doors || Math.max(1, Math.round(len / IN(30))), gap = IN(0.25);
      for (let k = 0; k < n; k++) {
        const sg = len / n;
        const d = along ? { x: front.x + k * sg + gap, y: front.y, w: sg - 2 * gap, h: front.h } : { x: front.x, y: front.y + k * sg + gap, w: front.w, h: sg - 2 * gap };
        const fw = IN(1.5), top = H - IN(1);
        box(d.x, d.y, d.w, d.h, IN(3), H - IN(4), doorGlass, false);
        if (along) {
          box(d.x, d.y, fw, d.h, IN(3), top - IN(3), trim, false); box(d.x + d.w - fw, d.y, fw, d.h, IN(3), top - IN(3), trim, false);
        } else {
          box(d.x, d.y, d.w, fw, IN(3), top - IN(3), trim, false); box(d.x, d.y + d.h - fw, d.w, fw, IN(3), top - IN(3), trim, false);
        }
        box(d.x, d.y, d.w, d.h, IN(3), fw, trim, false); box(d.x, d.y, d.w, d.h, top - fw, fw, trim, false);
        const near = k % 2 === 0 ? 1 : 0;           // pulls sit by the seam between a pair of doors
        const hd = along ? { x: near ? d.x + d.w - IN(2) : d.x + IN(1.5), y: d.y - IN(0.3), w: IN(0.5), h: d.h + IN(0.6) }
          : { x: d.x - IN(0.3), y: near ? d.y + d.h - IN(2) : d.y + IN(1.5), w: d.w + IN(0.6), h: IN(0.5) };
        box(hd.x, hd.y, hd.w, hd.h, IN(34), IN(7), metal, false);
      }
    };

    // Kitchens: the counter stops on each side of a freestanding range; sinks are set into the countertop and
    // a dishwasher sits under it, so nothing overlaps the stove or pokes through the top.
    const counters = L.furn.filter(g => g.t === "counter");
    const inCounter = f => counters.some(c => overlaps(furnRect(c), furnRect(f), 0.5));
    const counterOf = f => counters.find(c => overlaps(furnRect(c), furnRect(f), 0.5));
    const counterFront = f => { const c = counterOf(f) || f; return OPP[wallBack(L, c)]; };
    const steel = M("#C9CED6", { metalness: 0.55, roughness: 0.3 }), cab = M("#D6D0DE"), slabTop = M("#8D86A0");
    const counterRun = f => {
      const along = f.w >= f.h, lo = along ? f.x : f.y, hi = along ? f.x + f.w : f.y + f.h;
      const gaps = L.furn.filter(g => g.t === "range" && overlaps(furnRect(g), f, 0.5))
        .map(g => (along ? [g.x, g.x + g.w] : [g.y, g.y + g.h])).sort((a, b) => a[0] - b[0]);
      const pieces = [];
      let cur = lo;
      gaps.forEach(([a, z]) => { if (a - cur > 0.3) pieces.push([cur, a]); cur = Math.max(cur, z); });
      if (hi - cur > 0.3) pieces.push([cur, hi]);
      const front = OPP[wallBack(L, f)];
      pieces.forEach(([a, z]) => {
        const r = along ? { x: a, y: f.y, w: z - a, h: f.h } : { x: f.x, y: a, w: f.w, h: z - a };
        box(r.x, r.y, r.w, r.h, IN(4), IN(30.5), cab);                              // cabinets
        const kick = inset(r, 0), toe = band(kick, OPP[front], (along ? r.h : r.w) - IN(3));
        box(toe.x, toe.y, toe.w, toe.h, 0, IN(4), M("#5E5868"));                    // recessed toe kick
        box(r.x, r.y, r.w, r.h, IN(34.5), IN(1.5), slabTop);                        // countertop
      });
    };
    const range = f => {
      const back = wallBack(L, f), front = OPP[back], body = inset(f, IN(0.25));
      box(body.x, body.y, body.w, body.h, 0, IN(35.5), steel);
      box(body.x, body.y, body.w, body.h, IN(35.5), IN(0.75), M("#1F1D24", { roughness: 0.15 }));   // glass cooktop
      const bg = band(body, back, IN(2));
      box(bg.x, bg.y, bg.w, bg.h, IN(36.25), IN(5.5), steel);                     // backguard with the controls
      const top = band(body, front, (front === "t" || front === "b" ? body.h : body.w) - IN(2.5));
      [[0.27, 0.3], [0.73, 0.3], [0.27, 0.72], [0.73, 0.72]].forEach(([u, v], k) => {
        const r = IN(k % 3 === 0 ? 4.2 : 3.2);
        const ring = mesh(new T.TorusGeometry(r, IN(0.35), 6, 28), M("#7A3B2E", { roughness: 0.4 }), top.x + top.w * u, IN(36.35), top.y + top.h * v, false);
        ring.rotation.x = Math.PI / 2;
      });
      const door = band(inset(body, -IN(0.3)), front, IN(0.3));
      const dr = front === "t" || front === "b" ? { x: door.x + IN(1.5), y: door.y, w: door.w - IN(3), h: door.h } : { x: door.x, y: door.y + IN(1.5), w: door.w, h: door.h - IN(3) };
      box(dr.x, dr.y, dr.w, dr.h, IN(6), IN(22), M("#2A2830", { roughness: 0.2 }), false);                 // oven door glass
      const hb = band(inset(door, -IN(0.8)), front, IN(0.8));
      const hr = front === "t" || front === "b" ? { x: hb.x + IN(3), y: hb.y, w: hb.w - IN(6), h: hb.h } : { x: hb.x, y: hb.y + IN(3), w: hb.w, h: hb.h - IN(6) };
      box(hr.x, hr.y, hr.w, hr.h, IN(29.5), IN(1), metal, false);                                              // oven handle
    };
    const sinkInTop = f => {
      const bowl = inset(f, IN(1.5)), front = counterFront(f), back = OPP[front];
      box(bowl.x, bowl.y, bowl.w, bowl.h, IN(36), IN(0.12), steel, false);
      const basin = inset(bowl, IN(1.2));
      box(basin.x, basin.y, basin.w, basin.h, IN(36.02), IN(0.12), M("#8E959E", { metalness: 0.5, roughness: 0.35 }), false);
      const tap = band(f, back, IN(2.5)), cx = tap.x + tap.w / 2, cz = tap.y + tap.h / 2;
      cyl(cx, cz, IN(0.6), IN(36), IN(10), metal);
      const toward = { t: [0, 1], b: [0, -1], l: [1, 0], r: [-1, 0] }[back];
      box(cx - IN(0.5) + Math.min(0, toward[0]) * IN(6), cz - IN(0.5) + Math.min(0, toward[1]) * IN(6),
        IN(1) + Math.abs(toward[0]) * IN(6), IN(1) + Math.abs(toward[1]) * IN(6), IN(45), IN(1), metal, false);
    };

    // University furniture and fixtures, at the sizes measured in UMBC's tours
    L.furn.forEach(f => {
      const t = f.t;
      if (t === "toilet") {
        box(f.tank.x, f.tank.y, f.tank.w, f.tank.h, 0, IN(30), fix);
        cyl(f.cx, f.cy, 1, 0, IN(15), fix).scale.set(f.rx, 1, f.ry);
        return;
      }
      if (t === "round") { cyl(f.cx, f.cy, IN(2), 0, IN(28), dark); cyl(f.cx, f.cy, f.r, IN(28), IN(1.5), wood); return; }
      if (t === "heater") { cyl(f.cx, f.cy, f.r, 0, IN(60), fix); return; }
      const inner = inset(f, IN(2));
      switch (t) {
        case "closet": storage(f, WH, 0); break;
        case "pantry": storage(f, WH, 1); break;
        case "wardrobe": storage(f, Math.min(IN(SIZE_IN.wardrobeH), WH), 2); break;
        case "dresser": {
          fbox(f, 0, IN(30), wood); fbox(inset(f, -IN(0.5)), IN(30), IN(1.25), dark);
          const fr = band(inset(f, -IN(0.3)), f.front || "t", IN(0.3));
          [IN(10), IN(20)].forEach(y => box(fr.x, fr.y, fr.w, fr.h, y, IN(0.6), dark, false));
          break;
        }
        case "utility": fbox(f, 0, WH, [fix, fix, M(C3.ink), fix, fix, fix]); break;
        case "counter": counterRun(f); break;
        case "range": range(f); break;
        case "ksink":
          if (inCounter(f)) sinkInTop(f);
          else { fbox(f, 0, IN(35.5), fix); sinkInTop(f); }
          break;
        case "cabinet": fbox(f, 0, IN(34), fix); break;
        case "appl":
          if (inCounter(f)) {                       // dishwasher under the countertop: just its stainless door
            const fr = band(inset(f, -IN(0.4)), counterFront(f), IN(0.4));
            box(fr.x, fr.y, fr.w, fr.h, IN(4), IN(30), steel, false);
            const hd = band(inset(fr, IN(2)), counterFront(f), IN(0.4));
            box(hd.x, hd.y, hd.w, hd.h, IN(30), IN(1), metal, false);
          } else fbox(f, 0, f.label === "Fridge" ? IN(68) : IN(34), fix);
          break;
        case "washer": case "dryer": fbox(inset(f, IN(0.5)), 0, IN(38), fix); break;
        case "couch": case "sofa": case "loveseat": seat(f, IN(24)); break;
        case "chair": seat(f, IN(24)); break;
        case "coffee": legs(f, IN(16)); fbox(f, IN(16), IN(1.5), wood); break;
        case "end": legs(f, IN(22)); fbox(f, IN(22), IN(1.5), wood); break;
        case "endround": legs(f, IN(22)); fbox(f, IN(22), IN(1.5), wood); break;
        case "table": legs(inset(f, IN(1)), IN(28.5)); fbox(f, IN(28.5), IN(1.5), wood); break;
        case "tv": fbox(f, 0, IN(24), wood); box(f.x + f.w / 2 - IN(1), f.y + IN(2), IN(2), f.h - IN(4), IN(24), IN(26), M(C3.screen)); break;
        case "tub": fbox(f, 0, IN(18), fix); box(inner.x + 2, inner.y + 2, inner.w - 4, inner.h - 4, IN(17.6), IN(0.5), water); break;
        case "shower": fbox(f, 0, IN(4), fix); fbox(f, IN(4), Math.min(IN(74), WH - IN(4)), M(C3.glass, { transparent: true, opacity: 0.22, roughness: 0.1 }), false); break;
        case "sink": fbox(f, 0, IN(34), fix); box(f.x + f.w * 0.2, f.y + f.h * 0.2, f.w * 0.6, f.h * 0.6, IN(34), IN(0.5), water); break;
        default: fbox(f, 0, IN(20), wood);
      }
    });

    // UMBC beds: raised maple frames with slatted head and foot ends; decor on the ones in the order.
    const DECK = IN(24), MAT = IN(lvl >= 2 ? 10 : 8);
    L.beds.forEach((b, i) => {
      const on = bedOn[i];
      const horiz = b.head === "l" || b.head === "r", length = horiz ? b.w : b.h;
      const post = Math.min(IN(2.5), b.w / 6, b.h / 6);
      const headEnd = band(b, b.head, post), footEnd = band(b, OPP[b.head], post);
      const corners = [[0, 0], [1, 0], [0, 1], [1, 1]];
      corners.forEach(([u, v]) => {
        const px = b.x + u * (b.w - post), pz = b.y + v * (b.h - post);
        const atHead = (b.head === "l" && u === 0) || (b.head === "r" && u === 1) || (b.head === "t" && v === 0) || (b.head === "b" && v === 1);
        box(px, pz, post, post, 0, atHead ? IN(42) : IN(32), wood);
      });
      // three rails on each end, like the slatted ends in the tours
      [[headEnd, IN(42)], [footEnd, IN(32)]].forEach(([e, top]) => {
        [top - IN(3), top - IN(9), DECK].filter((y, k, a) => k === 2 || y > DECK + IN(3)).forEach(y => box(e.x, e.y, e.w, e.h, y, IN(2.5), wood));
      });
      // side rails carry the deck
      const sides = horiz ? [band(b, "t", post), band(b, "b", post)] : [band(b, "l", post), band(b, "r", post)];
      sides.forEach(s => box(s.x, s.y, s.w, s.h, DECK - IN(3), IN(4), wood));
      const deck = inset(b, post);
      box(deck.x, deck.y, deck.w, deck.h, DECK, IN(1), dark);
      if (L.underBedDrawers) {
        // two maple units under the deck, each with two drawers and pulls on the open side
        const bd = bedDrawers(L, b), alongX = bd.open === "t" || bd.open === "b";
        bd.units.forEach(u => {
          box(u.x, u.y, u.w, u.h, IN(1), IN(12), wood);
          const fr = band(inset(u, -IN(0.3)), bd.open, IN(0.3)), pcx = fr.x + fr.w / 2, pcz = fr.y + fr.h / 2;
          [IN(1.5), IN(7)].forEach(y0 => {
            box(fr.x, fr.y, fr.w, fr.h, y0, IN(5), dark, false);
            if (alongX) box(pcx - IN(2), pcz - IN(0.4), IN(4), IN(0.8), y0 + IN(2.1), IN(0.8), metal, false);
            else box(pcx - IN(0.4), pcz - IN(2), IN(0.8), IN(4), y0 + IN(2.1), IN(0.8), metal, false);
          });
        });
      }
      if (!on) { box(deck.x, deck.y, deck.w, deck.h, DECK + IN(1), MAT, M(C3.mattress)); return; }
      // storage bins under the bed (Walker's beds already have drawers there)
      if (!L.underBedDrawers) {
        const cx = b.x + b.w / 2, cz = b.y + b.h / 2, bw = horiz ? IN(26) : b.w * 0.7, bd = horiz ? b.h * 0.7 : IN(26);
        [-1, 1].forEach(sn => box(cx - bw / 2 + (horiz ? sn * IN(15) : 0), cz - bd / 2 + (horiz ? 0 : sn * IN(15)), bw, bd, 0, IN(11), M(pal.deep)));
      }
      const top = DECK + IN(1) + MAT;
      box(deck.x, deck.y, deck.w, deck.h, DECK + IN(1), MAT, bedding);
      const piping = inset(deck, IN(.5));
      ["t","b","l","r"].forEach(side => { const edge=band(piping,side,IN(.35));
        box(edge.x,edge.y,edge.w,edge.h,top-IN(.6),IN(.4),linen,false); });
      const fold = band(deck,b.head,IN(23));
      const foldEdge = band(fold,OPP[b.head],IN(1.5));
      box(foldEdge.x,foldEdge.y,foldEdge.w,foldEdge.h,top,IN(.6),linen,false);
      const pil = inset(band(deck, b.head, IN(20)), IN(2));
      puff(pil.x, pil.y, pil.w, pil.h, top, IN(5), linen);
      if (lvl >= 3) {
        const foot = band(deck, OPP[b.head], length * 0.28);
        box(foot.x, foot.y, foot.w, foot.h, top, IN(1.5), throwFabric);
        const px = pil.x + pil.w / 2, pz = pil.y + pil.h / 2, dx = horiz ? 0 : pil.w * 0.24, dz = horiz ? pil.h * 0.24 : 0, s = IN(14);
        puff(px - dx - s / 2, pz - dz - s / 2, s, s, top + IN(5), IN(5), fabric(pal.deep));
        puff(px + dx - s / 2, pz + dz - s / 2, s, s, top + IN(5), IN(5), throwFabric);
      }
      if (lvl >= 2 && b.art) {
        const [x1, y1, x2, y2, nx, ny] = b.art, hz = y1 === y2, inward = (hz ? ny : nx) > 0, face = artFace(L, b.art);
        const lo = hz ? Math.min(x1, x2) : Math.min(y1, y2), run = Math.abs(hz ? x2 - x1 : y2 - y1);
        const pl = IN(POSTER.w), ph = IN(POSTER.h);
        const colors = [pal.accent, pal.deep, pal.bed, pal.accent, pal.deep];
        const off = inward ? face + IN(0.3) : -(face + IN(0.9));
        posterGrid(run / L.U, lvl >= 3 ? 5 : 3).forEach((ps, k) => {
          const a = lo + IN(ps.along) - pl / 2, y0 = posterY + IN(ps.up) - ph / 2;
          if (y0 + ph > WH - IN(1)) return;   // cutaway walls: no wall to hang it on
          const art=texMat(ctx=>{
            ctx.fillStyle="#EFE9DC";ctx.fillRect(0,0,128,128);
            ctx.fillStyle=colors[k];ctx.beginPath();ctx.arc(64,48,27,0,Math.PI*2);ctx.fill();
            ctx.fillStyle=pal.deep;ctx.beginPath();ctx.moveTo(12,112);ctx.lineTo(52,65);ctx.lineTo(88,112);ctx.fill();
            ctx.fillStyle=pal.accent;ctx.fillRect(85,84,25,28);
            ctx.strokeStyle="#554738";ctx.lineWidth=7;ctx.strokeRect(0,0,128,128);
          });
          if (hz) box(a, y1 + off, pl, IN(0.6), y0, ph, art, false);
          else box(x1 + off, a, IN(0.6), pl, y0, ph, art, false);
        });
        if (lvl >= 3) {
          const wp = texMat(ctx => {
            ctx.fillStyle = pal.light; ctx.fillRect(0, 0, 128, 128);
            ctx.fillStyle = pal.bed;
            for (let sx = -128; sx < 256; sx += 32) {
              ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx + 14, 0); ctx.lineTo(sx + 14 - 128, 128); ctx.lineTo(sx - 128, 128); ctx.closePath(); ctx.fill();
            }
          }, run / IN(24), WH / IN(24));
          const wo = inward ? face + IN(0.05) : -(face + IN(0.25));
          if (hz) box(lo, y1 + wo, run, IN(0.2), 0, WH, wp, false);
          else box(x1 + wo, lo, IN(0.2), run, 0, WH, wp, false);
          const neon = M(pal.accent, { emissive: pal.accent, emissiveIntensity: 1.1 });
          const no = inward ? face + IN(1) : -(face + IN(2.5)), ny0 = Math.min(IN(86), WH - IN(4));
          if (hz) box(lo + IN(3), y1 + no, run - IN(6), IN(1.5), ny0, IN(1.5), neon, false);
          else box(x1 + no, lo + IN(3), IN(1.5), run - IN(6), ny0, IN(1.5), neon, false);
        }
      }
    });

    // Desks: maple top on a drawer pedestal, a shelf hutch in the residence halls, and the chair UMBC provides.
    const deskChair = (d, colors, upgraded) => {
      const ws = d.wall, s = IN(19), spot = chairSpot(L, d), cx = spot.x, cz = spot.y;
      const [seatMat, frameMat] = colors;
      if (upgraded || L.taskChair) {
        // Five-spoke task chair base and individual casters.
        for(let k=0;k<5;k++) {
          const a=k*Math.PI*2/5, reach=IN(8), ex=cx+Math.cos(a)*reach, ez=cz+Math.sin(a)*reach;
          slab(cx,cz,ex,ez,IN(.9),IN(1.5),IN(2.5),metal);
          const wheel=mesh(new T.CylinderGeometry(IN(1),IN(1),IN(.8),12),metal,ex,IN(1),ez);
          wheel.rotation.z=Math.PI/2;
        }
        cyl(cx, cz, IN(1.2), IN(1.5), IN(16), metal);
      } else {
        legs({ x: cx - s / 2, y: cz - s / 2, w: s, h: s }, IN(17), frameMat);
      }
      box(cx - s / 2, cz - s / 2, s, s, IN(17), IN(3), seatMat);
      const bt = IN(2), bh = IN(17);
      if (ws === "t") box(cx - s / 2, cz + s / 2 - bt, s, bt, IN(20), bh, seatMat);
      if (ws === "b") box(cx - s / 2, cz - s / 2, s, bt, IN(20), bh, seatMat);
      if (ws === "l") box(cx + s / 2 - bt, cz - s / 2, bt, s, IN(20), bh, seatMat);
      if (ws === "r") box(cx - s / 2, cz - s / 2, bt, s, IN(20), bh, seatMat);
    };
    L.desks.forEach((d, i) => {
      const along = d.w >= d.h, ws = d.wall;
      box(d.x, d.y, d.w, d.h, IN(29), IN(1.25), wood);
      const pd = deskPedestal(L, d), ped = pd.ped;
      const pedestal = along ? { x: pd.r.x, y: d.y + IN(.5), w: ped, h: d.h - IN(1) } : { x: d.x + IN(.5), y: pd.r.y, w: d.w - IN(1), h: ped };
      box(pedestal.x, pedestal.y, pedestal.w, pedestal.h, 0, IN(29), wood);
      // a leg panel at the far end of the knee space
      if (along) box(pd.start ? d.x + d.w - IN(1.25) : d.x, d.y + IN(0.5), IN(1.25), d.h - IN(1), 0, IN(29), wood);
      else box(d.x + IN(0.5), pd.start ? d.y + d.h - IN(1.25) : d.y, d.w - IN(1), IN(1.25), 0, IN(29), wood);
      const front = band(pedestal,OPP[ws],IN(.45));
      for(let j=0;j<3;j++) {
        const y=IN(1+j*9);
        const panel=inset(front,0);
        box(panel.x,panel.y,panel.w,panel.h,y,IN(8.4),wood);
        const handle=band(panel,OPP[ws],IN(.45));
        const hx=handle.x+handle.w/2,hz=handle.y+handle.h/2;
        box(hx-IN(.3),hz-IN(.3),IN(.6),IN(.6),y+IN(3),IN(2),metal);
        box(panel.x,panel.y,panel.w,panel.h,y+IN(8.5),IN(.35),dark,false);
      }
      if (L.hutch && WH > IN(56)) {
        const back = band(d, ws, IN(11));
        box(back.x, back.y, back.w, back.h, IN(41.5), IN(1), wood);
        box(back.x, back.y, back.w, back.h, IN(52.5), IN(1), wood);
        const ends = along ? [band(back, "l", IN(1)), band(back, "r", IN(1))] : [band(back, "t", IN(1)), band(back, "b", IN(1))];
        ends.forEach(e => box(e.x, e.y, e.w, e.h, IN(30.25), IN(23.25), wood));
      }
      const on = bedOn[i];
      const provided = L.taskChair ? [M("#4A4E57"), metal] : [wood, wood];
      if (!(on && lvl >= 3)) deskChair(d, provided, false);
      if (!on) return;
      if (lvl >= 2) {
        const lp = lampSpot(L, d, opt.major === "eng"), lx = lp.x, lz = lp.y;
        cyl(lx, lz, IN(3), IN(30.25), IN(0.75), M(pal.deep));
        cyl(lx, lz, IN(0.4), IN(31), IN(15), M(pal.deep));
        mesh(new T.CylinderGeometry(IN(1.8),IN(3.8),IN(4.5),24,1,true),
          M(pal.deep,{side:T.DoubleSide,roughness:.5}),lx,IN(46),lz);
        mesh(new T.SphereGeometry(IN(1.1),16,12),M("#FFE9BB",{emissive:"#FFD699",emissiveIntensity:.8}),lx,IN(44.8),lz,false);
        const lamp = new T.PointLight(0xffd27a, 0.5, IN(90), 2);
        lamp.position.set(lx, IN(46), lz);
        g.add(lamp);
      }
      if (opt.major === "eng") {
        // Built in a local frame: x along the desk (0 at its middle), z out from the wall, y up. Two 21" monitors on a
        // short stand fit under a hutch shelf (41.5") and between its end panels; mat and keyboard sit at the chair.
        const f = { t: [0, 1], b: [0, -1], l: [1, 0], r: [-1, 0] }[ws], grp = new T.Group(), top = IN(30.25);
        const along = d.w >= d.h, back = { t: [d.x + d.w / 2, d.y], b: [d.x + d.w / 2, d.y + d.h], l: [d.x, d.y + d.h / 2], r: [d.x + d.w, d.y + d.h / 2] }[ws];
        grp.position.set(back[0], 0, back[1]);
        grp.rotation.y = Math.atan2(f[0], f[1]);
        g.add(grp);
        const part = (geo, mat, px, py, pz, ry) => { geos.push(geo); const m = new T.Mesh(geo, mat); m.position.set(px, py, pz); if (ry) m.rotation.y = ry; m.castShadow = true; m.receiveShadow = true; grp.add(m); return m; };
        const ux = [Math.cos(grp.rotation.y), -Math.sin(grp.rotation.y)];   // world direction of local +x
        const spot = chairSpot(L, d), kx = (spot.x - back[0]) * ux[0] + (spot.y - back[1]) * ux[1];   // knee-space center, local x
        const depth = along ? d.h : d.w, z0 = IN(3.5);
        const shell = M("#2A2C33", { roughness: 0.45, metalness: 0.2 });
        const screen = texMat(ctx => {
          ctx.fillStyle = "#151A26"; ctx.fillRect(0, 0, 128, 128);
          ctx.fillStyle = "#232B3D"; ctx.fillRect(0, 0, 128, 10); ctx.fillRect(0, 10, 22, 118);
          const cols = ["#7AA2F7", "#9ECE6A", "#E0AF68", "#BB9AF7", "#7DCFFF", "#C0CAF5"];
          for (let r = 0; r < 13; r++) { ctx.fillStyle = cols[(r * 5) % cols.length]; ctx.fillRect(30 + (r % 4) * 6, 18 + r * 8, 18 + ((r * 37) % 60), 3); }
        });
        screen.emissive = new T.Color("#FFFFFF"); screen.emissiveMap = screen.map; screen.emissiveIntensity = 0.55;
        const mw = IN(18.7), mh = IN(10.5), toe = 0.2, my = top + IN(0.5) + mh / 2;
        // stand: weighted base, short pole, crossbar
        part(new T.BoxGeometry(IN(9), IN(0.6), IN(6)), shell, 0, top + IN(0.3), z0 + IN(1));
        part(new T.CylinderGeometry(IN(0.7), IN(0.7), my - top, 16), metal, 0, (top + my) / 2, z0);
        part(new T.BoxGeometry(IN(26), IN(1), IN(1)), metal, 0, my, z0 + IN(1.2));
        [-1, 1].forEach(sn => {
          const cx = sn * (mw / 2 + IN(0.5)) * Math.cos(toe), cz = z0 + IN(2.6) + Math.sin(toe) * mw / 2, ry = -sn * toe;
          part(new T.BoxGeometry(mw, mh, IN(1.2)), shell, cx, my, cz, ry);
          const face = part(new T.PlaneGeometry(mw - IN(0.7), mh - IN(0.8)), screen, cx + Math.sin(ry) * IN(0.61), my + IN(0.15), cz + Math.cos(ry) * IN(0.61), ry);
          face.castShadow = false;
        });
        // mat, keyboard and mouse in front of the chair
        part(new T.BoxGeometry(IN(30), IN(0.15), IN(12)), M("#30343E", { roughness: 1 }), kx, top + IN(0.08), Math.min(depth - IN(7), z0 + IN(14)));
        part(new T.BoxGeometry(IN(16), IN(0.7), IN(5)), M("#D9DCE3"), kx - IN(2), top + IN(0.5), Math.min(depth - IN(6), z0 + IN(14)));
        part(new T.BoxGeometry(IN(2.4), IN(1), IN(4)), M("#D9DCE3"), kx + IN(9), top + IN(0.6), Math.min(depth - IN(6), z0 + IN(14)));
      }
      if (lvl >= 3) deskChair(d, [M(pal.deep), metal], true);
    });

    // Room pieces: rug, mini-fridge, beanbag, major add-on
    decorSets(L, bedOn, roomOn).forEach(r => {
      if (lvl >= 3 && r.rug) {
        const [x, y, w, h] = r.rug;
        const rug = texMat(ctx => {
          ctx.fillStyle = pal.light; ctx.fillRect(0, 0, 128, 128);
          ctx.strokeStyle = pal.accent; ctx.lineWidth = 7; ctx.strokeRect(5, 5, 118, 118);
          ctx.setLineDash([8, 6]); ctx.lineWidth = 3; ctx.strokeRect(20, 20, 88, 88);
        });
        box(x, y, w, h, 0, IN(0.4), rug, false);
      }
      if (lvl >= 3 && r.fridge) {
        const [x, y] = r.fridge, s = IN(19);
        box(x - s / 2, y - s / 2, s, s, 0, IN(33), M("#F1F0F4"));
        box(x - s / 2 - IN(0.3), y - s / 2 - IN(0.3), s + IN(0.6), s + IN(0.6), IN(24), IN(0.8), M(pal.deep));
      }
      if (lvl >= 3 && r.bean) {
        const [x, y] = r.bean;
        const k = (r.beanD || 32) / 32;
        mesh(new T.SphereGeometry(IN(16 * k), 24, 16), M(pal.accent, { roughness: 1 }), x, IN(9 * k), y).scale.set(1, 0.6, 1);
      }
      if (r.extra && (opt.major === "art" || opt.major === "music")) {
        // Built in a local frame turned to face into the room: +z is away from the wall.
        const [x, y] = r.extra, f = facingOf(r), grp = new T.Group();
        grp.position.set(x, 0, y);
        grp.rotation.y = Math.atan2(f[0], f[1]);
        g.add(grp);
        const part = (geo, mat, px, py, pz) => { geos.push(geo); const m = new T.Mesh(geo, mat); m.position.set(px, py, pz); m.castShadow = true; m.receiveShadow = true; grp.add(m); return m; };
        const rod = (a, b, r0, mat) => {
          const dir = new T.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), len = dir.length();
          const m = part(new T.CylinderGeometry(r0, r0, len, 10), mat, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
          m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.normalize());
          return m;
        };
        if (opt.major === "art") {
          // A-frame easel: two front legs splay out and meet at the top, a rear leg props it back toward
          // the wall, and the canvas leans on a tray across the front legs.
          const top = [0, IN(64), -IN(0.5)];
          rod([-IN(11), 0, IN(7)], top, IN(0.7), dark);
          rod([IN(11), 0, IN(7)], top, IN(0.7), dark);
          rod([0, 0, -IN(9)], [0, IN(61), -IN(1.2)], IN(0.6), dark);
          rod([-IN(8.6), IN(16), IN(5.2)], [IN(8.6), IN(16), IN(5.2)], IN(0.45), dark);      // cross brace
          part(new T.BoxGeometry(IN(22), IN(1.2), IN(3)), M(pal.accent), 0, IN(29), IN(4.2));  // tray
          const canvas = part(new T.BoxGeometry(IN(18), IN(24), IN(1)), M("#FFFFFF"), 0, IN(41.5), IN(3.3));
          canvas.rotation.x = -0.13;
        } else {
          const half = IN(Math.min(36, (r.extraW || 38) - 2) / 2), leg = half - IN(5);
          [-1, 1].forEach(sn => {                                                          // X-stand
            rod([sn * leg, 0, -IN(6)], [sn * leg, IN(28), IN(6)], IN(0.6), metal);
            rod([sn * leg, 0, IN(6)], [sn * leg, IN(28), -IN(6)], IN(0.6), metal);
          });
          part(new T.BoxGeometry(half * 2, IN(3), IN(12)), M("#2B2930"), 0, IN(29.5), 0);
          part(new T.BoxGeometry(half * 2 - IN(2), IN(0.6), IN(5)), M("#FFFFFF"), 0, IN(31.2), IN(3));  // keys face the player
          part(new T.BoxGeometry(half * 2 - IN(2), IN(0.8), IN(2.5)), M(C3.screen), 0, IN(31.4), IN(0.8));
        }
      }
    });

    // Room view: the chosen room's furniture stays solid, its walls turn see-through so they don't block
    // the camera, and everything outside the room fades almost away.
    if (opt.focusRoom != null && L.rooms[opt.focusRoom]) {
      const rb = roomBox(L, opt.focusRoom), pad = IN(8), ghosts = new Map();
      const ghost = (mat, op) => {
        const key = mat.uuid + ":" + op;
        if (!ghosts.has(key)) {
          const m = mat.clone();
          m.transparent = true; m.opacity = Math.min(mat.opacity == null ? 1 : mat.opacity, op); m.depthWrite = false;
          mats.push(m); ghosts.set(key, m);
        }
        return ghosts.get(key);
      };
      g.updateMatrixWorld(true);
      const bb = new T.Box3(), c = new T.Vector3();
      g.traverse(o => {
        if (!o.isMesh || o.userData.floor) return;
        bb.setFromObject(o); bb.getCenter(c);
        const x = c.x + L.cx, y = c.z + L.cy;
        const inside = x >= rb.x - pad && x <= rb.x + rb.w + pad && y >= rb.y - pad && y <= rb.y + rb.h + pad;
        if (inside && !o.userData.wall) return;
        const op = o.userData.wall ? (inside ? 0.3 : 0.12) : 0.12;
        o.material = Array.isArray(o.material) ? o.material.map(mm => ghost(mm, op)) : ghost(o.material, op);
        o.castShadow = false;
      });
    }
    three.scene.add(g);
    three.group = g;
    const span = Math.max(L.w, L.h);
    three.R = Math.hypot(L.w, L.h);
    three.planW = L.w; three.planH = L.h;
    three.aspect = clamp((L.h + 140) / (L.w + 60), 0.55, 0.9);
    const sun = three.sun, sc = sun.shadow.camera;
    sun.position.set(-span * 0.35, span * 1.1, span * 0.55);
    sun.target.position.set(0, 0, 0);
    sc.left = -span * 0.75; sc.right = span * 0.75; sc.top = span * 0.75; sc.bottom = -span * 0.75;
    sc.near = 1; sc.far = span * 4;
    sc.updateProjectionMatrix();
    if (resetView) resetOrbit();
    size3D();
  }

  /* Building facts from UMBC Residential Life (reslife.umbc.edu/communities), checked October 2026,
     and finishes seen in UMBC's 360° Matterport tours. */
  const TOUR = id => "https://my.matterport.com/show/?m=" + id;
  const HALL_INFO = {
    susq: {
      title: "Chesapeake, Patapsco & Susquehanna Halls",
      facts: [["Bedroom", "Double, about 180 sq ft (10′ × 18′)"], ["UMBC provides", "XL twin beds, desks and chairs, wardrobes, blinds"],
              ["Floors", "Carpet, tile bathroom"], ["Who lives here", "Mostly first-year students. Residential meal plan required."],
              ["Kitchen & laundry", "Shared community kitchens. Free laundry on the basement or ground floor."]],
      rate: 9654, rateNote: "residence hall single or double",
      notes: ["Chesapeake: Center for Women in Technology living-learning community. Quiet floor 3W.",
              "Patapsco: LEED-certified. Discovery Scholars and STEM communities. Quiet floor 0S.",
              "Susquehanna: Honors College and first-year Meyerhoff Scholars, plus a large community room and kitchen. Quiet floor 3S."],
      tour: TOUR("3QDhJKoWT3H"), tourName: "Residence hall double"
    },
    potomac: {
      title: "Potomac Hall",
      facts: [["Bedroom", "Double, about 180 sq ft (10′ × 18′)"], ["UMBC provides", "XL twin beds, desks and chairs, wardrobes, blinds"],
              ["Floors", "Carpet, tile bathroom"], ["Who lives here", "Mostly first-year students. Meal plan required, plus a $50 January flex plan."],
              ["Kitchen & laundry", "Shared community kitchens. Free laundry on the basement or ground floor."]],
      rate: 9654, rateNote: "residence hall single or double",
      notes: ["UMBC's only nine-month residence hall, so it stays open over breaks.",
              "One all-male and one all-female floor wing.", "Quiet floor 0S."],
      tour: TOUR("3QDhJKoWT3H"), tourName: "Residence hall double"
    },
    triple: {
      title: "Residence hall triple + single",
      facts: [["Bedrooms", "Triple, about 300 sq ft (16′ × 18′); measured 16′4″ wide. The single beside it is 9′2″ wide."],
              ["UMBC provides", "XL twin beds, desks and chairs, wardrobes, blinds"],
              ["Floors", "Carpet, tile bathroom"], ["Who lives here", "Residence hall students. Residential meal plan required."],
              ["Kitchen & laundry", "Shared community kitchens. Free laundry on the basement or ground floor."]],
      rate: 6912, rateNote: "triple bedroom; the single in this suite is $9,654",
      notes: ["Traced from UMBC's Triple & Single Bedroom 360° tour. Room sizes are measured; furniture positions are approximate.",
              "UMBC charges triples the residence hall rate for triple and quad bedrooms."],
      tour: TOUR("aY8NV7qnrdf"), tourName: "Triple & single"
    },
    erickson: {
      title: "Erickson & Harbor Halls · double suites",
      facts: [["Bedroom", "Double, about 130 sq ft (10′ × 15′) plus a 5′ × 6′ walk-in closet"],
              ["UMBC provides", "XL twin beds, desks and chairs, dressers, blinds, a furnished common room"],
              ["Floors", "Wood-look plank in UMBC's 360° tour, tile bathroom"],
              ["Who lives here", "Students with 30+ credits or in a living-learning community. Meal plan required."],
              ["Kitchen & laundry", "Shared community kitchens. Free laundry in the building."]],
      rate: 9654, rateNote: "suite, 8-month (Harbor 9-month is $10,174)",
      notes: ["Erickson is home to Residential Life and the Shriver Living Learning Center. Quiet floor 4S.",
              "Harbor communities: Humanities, Intercultural Living Exchange, Visual & Performing Arts, and WILL. Quiet floor 4S."],
      tour: TOUR("qvvP68Cmrmh"), tourName: "Suite doubles"
    },
    harbor: {
      title: "Harbor Hall · single suites",
      facts: [["Bedroom", "Single, about 88 sq ft (8′ × 11′)"], ["UMBC provides", "XL twin bed, desk and chair, dresser, blinds"],
              ["Floors", "Wood-look plank in UMBC's 360° tour, tile bathroom"],
              ["Who lives here", "Singles go first to approved medical accommodations and upperclass students. Meal plan required."],
              ["Kitchen & laundry", "Shared community kitchens. Free laundry in the building."]],
      rate: 9654, rateNote: "suite, 8-month (9-month wings are $10,174)",
      notes: ["Four single bedrooms, a shared bath and two small entry areas.",
              "Half of Harbor stays open over breaks; those residents add a $50 January flex plan.", "Quiet floor 4S."],
      tour: TOUR("FnzeovJeARa"), tourName: "Suite singles"
    },
    harbormix: {
      title: "Harbor Hall · two singles and a double",
      facts: [["Bedrooms", "One double and two singles (singles about 88 sq ft, 8′ × 11′)"],
              ["UMBC provides", "XL twin beds, desks and chairs, dressers, blinds"],
              ["Floors", "Wood-look plank in UMBC's 360° tour, tile bathroom"],
              ["Who lives here", "Students with 30+ credits or in a living-learning community. Meal plan required."],
              ["Kitchen & laundry", "Shared community kitchens. Free laundry in the building."]],
      rate: 9654, rateNote: "suite, 8-month (9-month wings are $10,174)",
      notes: ["UMBC says Harbor has a few suites with two single bedrooms and one double, but hasn't published a plan or tour for them.",
              "This layout is an approximation: the Harbor single suite with two singles joined into the double."],
      tour: TOUR("FnzeovJeARa"), tourName: "Harbor singles (closest tour)"
    },
    terrace: {
      title: "Terrace & Hillside Apartments",
      facts: [["Bedroom", "Single, about 80 sq ft (8′ × 10′)"],
              ["UMBC provides", "XL twin bed, desk and chair, dresser, blinds. Loveseat, chair, end table, dining table and four chairs."],
              ["Floors", "Carpet, vinyl kitchen, tile bathroom"], ["Who lives here", "Students with 50+ credits. Meal plan optional."],
              ["Kitchen & laundry", "Electric stove and oven, microwave, full-size fridge. Free laundry at the Apartment Community Center and in Elk."]],
      rate: 10268, rateNote: "apartment single, 9-month continuous",
      notes: ["Open over breaks.", "Quiet buildings: Elk (Hillside) and Chincoteague (Terrace)."],
      tour: TOUR("XnNFCCgqmCD"), tourName: "Hillside & Terrace"
    },
    westhill: {
      title: "West Hill Apartments",
      facts: [["Bedroom", "Single, about 90 sq ft (9′ × 10′)"],
              ["UMBC provides", "XL twin bed, desk and chair, dresser, blinds. Loveseat or sofa, chair, end table, dining table and four chairs."],
              ["Floors", "Carpet, vinyl kitchen, tile bathroom"], ["Who lives here", "Students with 50+ credits. Meal plan optional."],
              ["Kitchen & laundry", "Electric stove and oven, microwave, full-size fridge. Free laundry at the Apartment Community Center."]],
      rate: 10268, rateNote: "apartment single, 9-month continuous",
      notes: ["Open over breaks.", "Quiet building: Wye."],
      tour: TOUR("Ec3aufsLroF"), tourName: "West Hill"
    },
    walker: {
      title: "Walker Avenue Apartments",
      facts: [["Bedroom", "Single, 10′1″ × 12′0″ to 10′3″ × 12′3″"], ["UMBC provides", "Bed with two two-drawer units underneath, desk and chair, built-in closet. Full kitchen and living area."],
              ["Floors", "Carpet; tile in the kitchen, laundry and baths"],
              ["Who lives here", "Students with 39+ credits. The only campus housing open to graduate students."],
              ["Kitchen & laundry", "Full kitchen. A washer and dryer in every apartment."]],
      rate: null, rateNote: "Rates are set by Walker Avenue management",
      notes: ["Owned by MEDCO and run by Capstone On-Campus Management, with Residential Life services.", "Two full baths for four bedrooms."],
      tour: "https://walkeravenueapts.com", tourName: "Walker Avenue website"
    }
  };
  const FLOOR_NAMES = { carpet: "Carpet", wood: "Wood-look plank", tile: "Tile", vinyl: "Vinyl" };

  function renderBuilding() {
    const L = LAYOUTS[state.hall], I = HALL_INFO[state.hall], P = PACKAGES[state.pkg], M = MAJORS[state.major];
    const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const per = P.price + M.price;
    const tips = ["Sheets come in Twin XL to fit UMBC's extra-long twin beds."];
    if (L.group === "Residence halls") tips.push("Microwaves aren't allowed in hall and suite rooms, so the Deluxe mini-fridge comes without one.");
    tips.push("UMBC rooms come with standard blinds. Basic and Deluxe swap in blackout blinds.");
    if (I.rate) tips.push("Your " + P.name + " setup costs about " + Math.round(per / I.rate * 100) + "% of a year's housing rate.");
    $("#building").innerHTML =
      '<div class="b-head"><div><p class="eyebrow">About this building · from UMBC Residential Life</p><h3>' + esc(I.title) + '</h3></div>' +
      '<a class="btn btn-ghost btn-sm" href="' + I.tour + '" target="_blank" rel="noopener">' + (I.tour.indexOf("matterport") > 0 ? "360° tour: " : "") + esc(I.tourName) + ' ↗</a></div>' +
      '<dl class="b-facts">' + I.facts.map(f => '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>').join("") +
      '<div><dt>Housing rate 2026–27</dt><dd>' + (I.rate ? money(I.rate) + ' a year · ' + esc(I.rateNote) : esc(I.rateNote)) + '</dd></div></dl>' +
      '<ul class="b-notes">' + I.notes.map(n => '<li>' + esc(n) + '</li>').join("") + '</ul>' +
      '<div class="b-tips"><b>For your order</b>' + tips.map(t => '<span>' + esc(t) + '</span>').join("") + '</div>';
  }

  /* ---------- 2D zoom and pan ---------- */
  let pv = null, focusKey = null, focus3dPending = null;
  function fullBox(L) { return planBox(L); }
  // Keep the view inside the plan, at the plan's aspect ratio so the drawing never changes height.
  function clampView(L, v) {
    const F = fullBox(L);
    const w = clamp(v.w, F.w / 8, F.w), h = w * F.h / F.w;
    const cx = v.x + v.w / 2, cy = v.y + v.h / 2;
    return { w, h, x: clamp(cx - w / 2, F.x, F.x + F.w - w), y: clamp(cy - h / 2, F.y, F.y + F.h - h) };
  }
  function fitView(L, b) {
    const F = fullBox(L), ar = F.w / F.h, pad = 16;
    let w = b.w + pad * 2, h = b.h + pad * 2;
    if (w / h > ar) h = w / ar; else w = h * ar;
    return clampView(L, { x: b.x + b.w / 2 - w / 2, y: b.y + b.h / 2 - h / 2, w, h });
  }
  // The bedroom around a bed: its beds, desks and open floor spots.
  function roomBox(L, ri) {
    const xs = [], ys = [];
    const add = (x, y, w, h) => { xs.push(x, x + w); ys.push(y, y + h); };
    L.beds.forEach((b, i) => { if (L.bedRoom[i] !== ri) return; add(b.x, b.y, b.w, b.h); const d = L.desks[i]; add(d.x, d.y, d.w, d.h); });
    const r = L.rooms[ri];
    if (r) {
      if (r.rug) add(r.rug[0], r.rug[1], r.rug[2], r.rug[3]);
      ["fridge", "bean", "extra"].forEach(k => { if (r[k]) add(r[k][0] - 14, r[k][1] - 14, 28, 28); });
    }
    let x0 = Math.min.apply(null, xs), y0 = Math.min.apply(null, ys), x1 = Math.max.apply(null, xs), y1 = Math.max.apply(null, ys);
    // The room's own closet, wardrobe or dresser: storage within 24" that no wall separates from the room.
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, reach = 24 * L.U;
    L.furn.forEach(f => {
      if (!STORAGE[f.t]) return;
      const fr = furnRect(f);
      if (fr.x > x1 + reach || fr.x + fr.w < x0 - reach || fr.y > y1 + reach || fr.y + fr.h < y0 - reach) return;
      const fx = fr.x + fr.w / 2, fy = fr.y + fr.h / 2;
      if (wallBetween(L, cx, cy, fx, fy)) return;
      x0 = Math.min(x0, fr.x); y0 = Math.min(y0, fr.y); x1 = Math.max(x1, fr.x + fr.w); y1 = Math.max(y1, fr.y + fr.h);
    });
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  // Does a wall cross the straight line between two points?
  function wallBetween(L, ax, ay, bx, by) {
    return wallLines(L).some(([x1, y1, x2, y2]) => {
      const d = (bx - ax) * (y2 - y1) - (by - ay) * (x2 - x1);
      if (Math.abs(d) < 1e-9) return false;
      const t = ((x1 - ax) * (y2 - y1) - (y1 - ay) * (x2 - x1)) / d, u = ((x1 - ax) * (by - ay) - (y1 - ay) * (bx - ax)) / d;
      return t > 0.001 && t < 0.999 && u >= 0 && u <= 1;
    });
  }
  function applyView2D() {
    const svg = $("#plan"), zoomed = pv.w < fullBox(LAYOUTS[state.hall]).w - 0.5;
    svg.setAttribute("viewBox", pv.x + " " + pv.y + " " + pv.w + " " + pv.h);
    svg.style.touchAction = zoomed ? "none" : "pan-y";
    svg.classList.toggle("zoomed", zoomed);
  }
  function zoom2D(f, px, py) {
    const L = LAYOUTS[state.hall], F = fullBox(L);
    const cx = px == null ? pv.x + pv.w / 2 : px, cy = py == null ? pv.y + pv.h / 2 : py;
    const w = clamp(pv.w * f, F.w / 8, F.w), k = w / pv.w;
    pv = clampView(L, { x: cx - (cx - pv.x) * k, y: cy - (cy - pv.y) * k, w, h: pv.h * k });
    applyView2D();
  }
  function svgPoint(svg, clientX, clientY) {
    const r = svg.getBoundingClientRect(), cs = getComputedStyle(svg);
    const pl = parseFloat(cs.paddingLeft), pt = parseFloat(cs.paddingTop);
    const iw = r.width - pl - parseFloat(cs.paddingRight), ih = r.height - pt - parseFloat(cs.paddingBottom);
    return { x: pv.x + (clientX - r.left - pl) / iw * pv.w, y: pv.y + (clientY - r.top - pt) / ih * pv.h, k: pv.w / iw };
  }
  function init2DGestures() {
    const svg = $("#plan"), pts = new Map();
    let moved = false, pinch = null;
    const spread = () => { const a = Array.from(pts.values()); return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) || 1; };
    svg.addEventListener("pointerdown", e => {
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY });
      moved = false;
      if (pts.size === 2) {
        const a = Array.from(pts.values());
        pinch = { d: spread(), w: pv.w, c: svgPoint(svg, (a[0].x + a[1].x) / 2, (a[0].y + a[1].y) / 2) };
      }
    });
    svg.addEventListener("pointermove", e => {
      const p = pts.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;
      if (pts.size === 2 && pinch) {
        moved = true;
        zoom2D(pinch.w * pinch.d / spread() / pv.w, pinch.c.x, pinch.c.y);
        return;
      }
      if (!moved && Math.hypot(e.clientX - p.sx, e.clientY - p.sy) < 5) return;
      if (!moved) { moved = true; svg.setPointerCapture(e.pointerId); svg.classList.add("grabbing"); }
      const k = svgPoint(svg, 0, 0).k;
      pv = clampView(LAYOUTS[state.hall], { x: pv.x - dx * k, y: pv.y - dy * k, w: pv.w, h: pv.h });
      applyView2D();
    });
    const release = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) svg.classList.remove("grabbing"); };
    svg.addEventListener("pointerup", release);
    svg.addEventListener("pointercancel", release);
    // A drag shouldn't also count as tapping a bed.
    svg.addEventListener("click", e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    svg.addEventListener("wheel", e => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const p = svgPoint(svg, e.clientX, e.clientY);
      zoom2D(1 + e.deltaY * 0.01, p.x, p.y);
    }, { passive: false });
  }
  function focusView(box, animate) {
    const L = LAYOUTS[state.hall];
    pv = box ? fitView(L, box) : fullBox(L);
    applyView2D();
    if (three && three.L === L && state.view === "3d") focus3D(box, animate);
    else focus3dPending = "jump";
  }
  function setMode(m) {
    if (three) {
      three.mode = m;
      three.renderer.domElement.style.touchAction = m === "move" ? "none" : "pan-y";
    }
    $("#mRotate").setAttribute("aria-pressed", String(m === "rotate"));
    $("#mMove").setAttribute("aria-pressed", String(m === "move"));
    updateHint();
  }
  function updateHint() {
    const mode = three ? three.mode : "rotate";
    $("#vHint").textContent = state.view !== "3d"
      ? "Drag to move around · pinch or +/− to zoom · tap a bed to make it yours"
      : mode === "move" ? "Drag to move around · pinch or +/− to zoom"
      : "Drag to rotate · right-drag, shift-drag or two fingers to move";
  }

  /* ---------- Planner state ---------- */
  const STORE_KEY = "dormdesigner.planner";
  const state = { hall: "susq", pkg: "basic", palette: "berry", major: "none", designed: true, scope: "me", bed: 0, view: "2d", walls: "full", focus: "room" };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (saved) {
      if (LAYOUTS[saved.hall]) state.hall = saved.hall;
      if (PACKAGES[saved.pkg]) state.pkg = saved.pkg;
      if (PALETTES[saved.palette]) state.palette = saved.palette;
      if (MAJORS[saved.major]) state.major = saved.major;
      if (saved.scope === "me" || saved.scope === "suite") state.scope = saved.scope;
      if (LAYOUTS[state.hall].beds[saved.bed]) state.bed = saved.bed;
    }
  } catch (e) { /* storage unavailable; use defaults */ }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }

  const $ = s => document.querySelector(s);
  const money = n => "$" + n.toLocaleString("en-US");

  // The site's pages share this script; each uses the parts it has. Package buttons anywhere remember the
  // choice so the planner and order form open on it.
  function buildControls() {
    document.querySelectorAll("[data-pick]").forEach(b => b.addEventListener("click", () => { state.pkg = b.dataset.pick; state.designed = true; save(); }));
    fillReserve();
    const hallList = $("#hallList");
    if (!hallList) return;
    let group = "";
    Object.keys(RAW_LAYOUTS).forEach(k => {
      const L = RAW_LAYOUTS[k];   // the raw entry: names only, without fitting every layout up front
      if (L.group !== group) {
        group = L.group;
        const g = document.createElement("div");
        g.className = "opt-group";
        g.textContent = group;
        hallList.appendChild(g);
      }
      hallList.insertAdjacentHTML("beforeend",
        '<label class="opt"><input type="radio" name="hall" id="hall-' + k + '" value="' + k + '"><span class="box"><span>' + L.short + '</span></span></label>');
    });
    Object.keys(PACKAGES).forEach(k => {
      const P = PACKAGES[k];
      $("#pkgList").insertAdjacentHTML("beforeend",
        '<label class="opt"><input type="radio" name="pkg" id="pkg-' + k + '" value="' + k + '"><span class="box"><b>' + P.name + '</b><small>' + money(P.price) + '</small></span></label>');
    });
    Object.keys(PALETTES).forEach(k => {
      const P = PALETTES[k];
      $("#palList").insertAdjacentHTML("beforeend",
        '<label class="opt swatch"><input type="radio" name="palette" id="pal-' + k + '" value="' + k + '" aria-label="' + P.name + '"><span class="box"><span class="chips"><i style="background:' + P.bed + '"></i><i style="background:' + P.accent + '"></i><i style="background:' + P.deep + '"></i></span><span>' + P.name + '</span></span></label>');
    });
    Object.keys(MAJORS).forEach(k => {
      const M = MAJORS[k];
      $("#majorList").insertAdjacentHTML("beforeend",
        '<label class="opt"><input type="radio" name="major" id="major-' + k + '" value="' + k + '"><span class="box"><span>' + M.name + '</span><small>' + (M.price ? "+" + money(M.price) : "") + '</small></span></label>');
    });


    $("#plannerForm").addEventListener("change", e => {
      const n = e.target.name;
      if (!n || !(n in state)) return;
      state[n] = n === "bed" ? Number(e.target.value) : e.target.value;
      if (n === "bed") state.scope = "me";
      update();
    });
    $("#viewEmpty").addEventListener("click", () => { state.designed = false; update(); });
    $("#viewDesigned").addEventListener("click", () => { state.designed = true; update(); });
    $("#view2d").addEventListener("click", () => { state.view = "2d"; update(); });
    $("#view3d").addEventListener("click", open3D);
    init2DGestures();
    const in3d = () => state.view === "3d" && three && three.L;
    $("#zIn").addEventListener("click", () => (in3d() ? zoom3D(0.8) : zoom2D(0.75)));
    $("#zOut").addEventListener("click", () => (in3d() ? zoom3D(1.25) : zoom2D(1.33)));
    $("#zRoom").addEventListener("click", () => { const L = LAYOUTS[state.hall]; state.focus = "room"; focusView(roomBox(L, L.bedRoom[state.bed]), true); update(); });
    $("#zAll").addEventListener("click", () => { state.focus = "all"; focusView(null, true); update(); });
    $("#mRotate").addEventListener("click", () => setMode("rotate"));
    $("#mMove").addEventListener("click", () => setMode("move"));
    $("#wallsBtn").addEventListener("click", () => { state.walls = state.walls === "low" ? "full" : "low"; update(); if (three && three.L) focus3D(state.scope === "me" ? roomBox(three.L, three.L.bedRoom[state.bed]) : null, true); });
    $("#toReserve").addEventListener("click", save);
  }

  // The order form's selects list every hall, package, palette and setup, and open on the planner's choices.
  function fillReserve() {
    if (!$("#rHall")) return;
    const fill = (sel, obj, label) => Object.keys(obj).forEach(k => sel.insertAdjacentHTML("beforeend", '<option value="' + k + '">' + label(obj[k]) + '</option>'));
    fill($("#rHall"), RAW_LAYOUTS, L => L.short);
    fill($("#rPkg"), PACKAGES, P => P.name + " · " + money(P.price));
    fill($("#rPal"), PALETTES, P => P.name);
    fill($("#rMajor"), MAJORS, M => M.name + (M.price ? " · +" + money(M.price) : ""));
  }
  function syncReserve() {
    if (!$("#rHall")) return;
    $("#rHall").value = state.hall; $("#rPkg").value = state.pkg; $("#rPal").value = state.palette; $("#rMajor").value = state.major;
  }

  let bedsBuiltFor = null, view3dFor = null;
  function planOptions() {
    const mine = state.scope === "me";
    return {
      pkg: state.pkg, palette: state.palette, major: state.major, designed: state.designed,
      owned: mine ? [state.bed] : null,
      you: mine ? state.bed : null,
      onBed: i => { state.bed = i; state.scope = "me"; update(); }
    };
  }

  function update() {
    const L = LAYOUTS[state.hall], P = PACKAGES[state.pkg], pal = PALETTES[state.palette], M = MAJORS[state.major];
    if (bedsBuiltFor !== state.hall) {
      bedsBuiltFor = state.hall;
      if (!L.beds[state.bed]) state.bed = 0;
      $("#bedList").innerHTML = L.bedNames.map((n, i) =>
        '<label class="opt"><input type="radio" name="bed" id="bed-' + i + '" value="' + i + '" aria-label="Bed ' + n + '"><span class="box"><b>' + n + '</b></span></label>').join("");
    }
    $("#bedPick").hidden = state.scope !== "me";
    ["hall", "pkg", "palette", "major", "scope", "bed"].forEach(n => {
      const input = document.querySelector('input[name="' + n + '"][value="' + state[n] + '"]');
      if (input) input.checked = true;
    });
    $("#viewEmpty").setAttribute("aria-pressed", String(!state.designed));
    $("#viewDesigned").setAttribute("aria-pressed", String(state.designed));
    $("#planTitle").textContent = L.name;
    $("#planType").textContent = L.type;
    $("#planSrc").textContent = "Approximate scale · size " + L.real.src;
    const svg = $("#plan");
    const opts = planOptions();
    const focusBox = state.scope === "me" ? roomBox(L, L.bedRoom[state.bed]) : null;
    const fKey = state.hall + "|" + state.scope + "|" + state.bed;
    if (fKey !== focusKey) {
      const sameHall = focusKey && focusKey.split("|")[0] === state.hall;
      focusKey = fKey;
      pv = focusBox ? fitView(L, focusBox) : fullBox(L);
      focus3dPending = sameHall ? "animate" : "jump";
      state.focus = focusBox ? "room" : "all";
    }
    // While one room is in view, everything outside it fades so the room is easy to see.
    opts.focusRoom = state.focus === "room" ? L.bedRoom[state.bed] : null;
    renderPlan(svg, state.hall, opts);
    applyView2D();
    const whose = state.scope === "me" ? "bed " + L.bedNames[state.bed] : "every bed";
    svg.setAttribute("aria-label", "Floor plan of " + L.name + ", " + L.desc.toLowerCase() + (state.designed ? ", with " + whose + " decorated in the " + P.name + " package and " + pal.name + " palette" : ", shown empty"));

    const is3d = state.view === "3d";
    svg.toggleAttribute("hidden", is3d);  // SVG elements have no .hidden property
    $("#stage3d").hidden = !is3d;
    $("#view2d").setAttribute("aria-pressed", String(!is3d));
    $("#view3d").setAttribute("aria-pressed", String(is3d));
    $("#modeToggle").hidden = !is3d;
    $("#wallsBtn").hidden = !is3d;
    $("#wallsBtn").textContent = state.walls === "low" ? "Full-height walls" : "Cutaway walls";
    $("#zRoom").textContent = L.roomNames ? L.roomNames[L.bedRoom[state.bed]]
      : L.bedRoom.filter(r => r === L.bedRoom[state.bed]).length > 1 ? "Room " + L.bedNames[state.bed].charAt(0) : "Bedroom " + L.bedNames[state.bed];
    updateHint();
    if (is3d && three) {
      build3D(state.hall, opts, false);
      if (focus3dPending || view3dFor !== state.hall) {
        focus3D(focusBox, focus3dPending === "animate" && view3dFor === state.hall);
        focus3dPending = null;
      }
      view3dFor = state.hall;
    }

    // Legend: only what is drawn.
    const leg = [];
    if (state.designed) {
      leg.push([pal.bed, "Bedding"]);
      if (P.level >= 2) leg.push([pal.deep, "Posters & blinds"], ["#FFC83A", "Desk lamp"]);
      if (P.level >= 3) leg.push([pal.accent, "Neon, beanbag & throw"], [pal.light, "Rug & wallpaper"]);
      if (state.major !== "none") leg.push([pal.deep, M.item]);
    } else {
      leg.push(["transparent", "Furniture provided by UMBC"]);
    }
    if (L.floors) {
      const kinds = [baseFloor(L)].concat(L.floors.map(f => f.type)).filter((k, i, a) => a.indexOf(k) === i);
      const sw = { carpet: "var(--plan-floor)", wood: "var(--plan-wood)", tile: "var(--plan-tile)", vinyl: "var(--plan-tile)" };
      kinds.forEach(k => leg.push([sw[k], FLOOR_NAMES[k] + " floor"]));
    }
    $("#legend").innerHTML = leg.map(l => '<span><i style="background:' + l[0] + ';border:1px solid var(--rule)"></i>' + l[1] + '</span>').join("") +
      (state.scope === "me" ? '<span><i style="border:1.5px dashed var(--accent)"></i>Your bed · roommates shown as provided</span>' : "");

    // Price summary
    // Shared pieces (rug, fridge, bathroom set) are split when everyone sharing them orders: that's the whole
    // suite here, so "Just my bed" shows what you'd save if they did.
    const base = P.price + M.price, saving = shareSavings(L, state.bed, P.level), suite = state.scope !== "me";
    const per = suite ? base - saving : base;
    $("#qPkg").textContent = P.name + (M.price ? " + " + M.name + " setup" : "") + " · " + pal.name;
    $("#qPrice").textContent = money(per);
    $("#qMonth").textContent = money(Math.round(per / 9));
    $("#qShareRow").hidden = !saving;
    $("#qShareLabel").textContent = suite ? "Shared with roommates, bed " + L.bedNames[state.bed] : "If your roommates order too";
    $("#qShare").textContent = (suite ? "−" : "save ") + money(saving);
    if (!suite) {
      $("#qSuiteLabel").textContent = "Your bed · roommates order on their own";
      $("#qSuite").textContent = L.bedNames[state.bed];
    } else {
      const total = L.beds.reduce((sum, b, i) => sum + base - shareSavings(L, i, P.level), 0);
      $("#qSuiteLabel").textContent = "Whole " + (L.group === "Apartments" ? "apartment" : "suite") + " (" + L.residents + " students)";
      $("#qSuite").textContent = money(total);
    }

    // Item list
    const list = ITEMS.filter(it => it.lvl <= P.level && !(it.max && P.level > it.max) && !(it.noDrawers && L.underBedDrawers));
    const shareTag = it => {
      const n = shareCount(L, state.bed, it.share);
      if (n < 2) return "";
      return ' <span class="share">' + (suite ? "Split " + n + " ways" : "Shared") + '</span>';
    };
    // Your decor set on the plan: say so when a piece couldn't go anywhere without blocking the way.
    const mySet = L.bedRoom.filter(r => r === L.bedRoom[state.bed]).length > 1 && L.bedSpots ? L.bedSpots[state.bed] : L.rooms[L.bedRoom[state.bed]];
    const noSpot = ' <span class="tag">no clear floor spot · not on plan</span>';
    const offPlan = it => it.name === "Beanbag" && mySet && mySet.bean === null;
    let html = list.map(it =>
      '<li class="' + (it.lvl === P.level && P.level > 1 ? "new" : "") + '">' + it.name.replace(/&/g, "&amp;") +
      (it.keep ? ' <span class="keep">Keep</span>' : "") + (it.share ? shareTag(it) : "") +
      (offPlan(it) ? noSpot : it.plan && state.designed ? ' <span class="tag">on plan</span>' : "") + '</li>').join("");
    if (M.item) html += '<li class="new">' + M.item.replace(/&/g, "&amp;") + ' <span class="tag">' + M.name + ' add-on</span>' +
      (mySet && mySet.extra === null && (state.major === "art" || state.major === "music") ? noSpot : "") + '</li>';
    $("#items").innerHTML = html;
    $("#itemsHead").textContent = "Per student · " + (list.length + (M.item ? 1 : 0)) + " items";

    renderBuilding();
    syncReserve();
    save();
  }

  /* ---------- Reservation (demo only) ---------- */
  function initReserve() {
    const form = $("#reserveForm");
    if (!form) return;
    form.addEventListener("submit", e => {
      e.preventDefault();
      form.querySelectorAll(".err").forEach(n => n.remove());
      const name = $("#rName"), email = $("#rEmail"), student = $("#rStudent");
      let ok = true;
      if (!name.value.trim()) { name.insertAdjacentHTML("afterend", '<span class="err">Enter your name.</span>'); ok = false; }
      if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) { email.insertAdjacentHTML("afterend", '<span class="err">Enter an email like name@example.com.</span>'); ok = false; }
      if (!student.value.trim()) { student.insertAdjacentHTML("afterend", '<span class="err">Enter your student\'s name.</span>'); ok = false; }
      if (!ok) return;
      const L = RAW_LAYOUTS[$("#rHall").value], P = PACKAGES[$("#rPkg").value], M = MAJORS[$("#rMajor").value], pal = PALETTES[$("#rPal").value];
      const c = $("#confirm");
      const safe = s => s.replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
      c.innerHTML = "<b>Order request saved on this page</b><span>For " + safe(student.value.trim()) + " · " + L.short + " · " + P.name + " in " + pal.name +
        (M.price ? " with the " + M.name + " setup" : "") + " · " + money(P.price + M.price) + " for the year, before any shared savings.</span>" +
        "<span>We'd confirm the design with " + safe(name.value.trim()) + " by email before move-in.</span>" +
        "<span style=\"color:var(--muted)\">This example site doesn't send requests, so nothing was emailed.</span>";
      c.hidden = false;
    });
    ["rHall", "rPkg", "rPal", "rMajor"].forEach((idName, i) => {
      $("#" + idName).addEventListener("change", e => { state[["hall", "pkg", "palette", "major"][i]] = e.target.value; save(); });
    });
  }

  buildControls();
  initReserve();
  if ($("#heroPlan")) renderPlan($("#heroPlan"), "susq", { pkg: "deluxe", palette: "berry", major: "none", designed: true, owned: [0, 1] });
  if ($("#plannerForm")) update(); else syncReserve();
})();