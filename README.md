# DormDesigner

Example website for DormDesigner, a dorm setup and decor rental service (ENTR 200, Group A).

**Team:** Patrick Gray, Ayooluwatomi Akeju, Yitzchuk Rosenblat, Yuvan Vijayabaskar, De'Angelo Pierce

## What's on the site

The site speaks to DormDesigner's two clients, parents and university housing, following the customer discovery work. Students still choose their own colors, posters and major setup.

| Page | What's there |
|---|---|
| `index.html` | Home: what we do, who we work with, how it works, packages at a glance |
| `parents.html` | For parents: what's included, the year from order to pickup, shared savings, FAQ, and the room order form |
| `universities.html` | For universities: partnership benefits, how a partnership runs, the pilot offer, what UMBC residents told us, FAQ, and a partnership inquiry form |
| `packages.html` | Essentials ($450/yr), Basic ($850/yr), Deluxe ($1,500/yr), setups for majors, shared savings, and how we compare |
| `planner.html` | Room planner: pick a UMBC floor plan, a package, a color palette and a major setup, and see the room in 2D or 3D |
| `about.html` | Our story, values and team |

Shared files live in `assets/`: `site.css`, `site.js` (phone menu and the inquiry form), `planner.js` (floor plans, room fitting, 2D and 3D drawing, and the order form), `mark.png` (the logo mark) and `img/` (room renders from the planner's 3D view, used on the home, parents, universities and packages pages).

Planner details:

- **Just my bed** decorates only the bed you pick (tap a bed on the plan); roommates' beds stay as the university provides them. **Whole suite** decorates every bed plus shared rooms and shows the suite total.
- **3D view** turns the same floor plan into a model you can rotate and zoom. It loads three.js from cdnjs the first time someone opens it.
- Rugs, mini-fridges and bathroom sets are shared: when everyone in a bedroom (or using a bathroom) orders, they get one and split the cost, which comes off each person's price. Posters are all 11" × 17": 3 with Basic, 5 with Deluxe.
- Everything stays usable: every room door and wardrobe door has room to swing all the way open, built-in closets have sliding doors, every desk chair has 36" to roll back, and chairs sit beside the desk drawers rather than in them. Desks move along their wall, or to another wall of the same room, to make that work, and beds sit flush against the walls.
- Decor stays out of the way: the planner works out the routes people walk from the front door to each bed, desk, closet, door and fixture (not drawn), keeps the fridge, beanbag and add-on off them, and puts the easel and keyboard against a wall, and the fridge against a wall or the foot of the bed, when it can. If a beanbag or add-on can't fit without blocking something, it's left off the plan and the item list says so.

Plans are drawn to scale: each one is stretched to the overall size measured with the measuring tool in UMBC's 360° tours (Walker Avenue uses the room sizes printed on its plan, and Potomac is scaled from its extra-long twin beds). Beds use UMBC's real frame size (about 40" × 84"), and the 3D view uses real heights: 8 ft ceilings, 80" doors, 30" desks with hutches in the halls.

The floor plans are redrawn from UMBC Residential Life's published plans: Susquehanna/Patapsco/Chesapeake, Potomac, Erickson/Harbor double suite, Harbor single suite, Terrace/Hillside, West Hill and Walker Avenue. Two more layouts have no published plan:

- **Residence hall triple + single** is traced from UMBC's Triple & Single Bedroom 360° tour. Room sizes are measured there (suite 25′8″ wide, triple 21′4″ deep, single 9′2″ × 19′2″); furniture positions are approximate.
- **Harbor Hall two singles + double** is an approximation. UMBC says these suites exist but hasn't published a plan or tour, so it's drawn from the Harbor single-suite shell with two singles joined into the double.

DormDesigner isn't affiliated with UMBC.

## Run it

It's a static site with no build step. Open `index.html` in a browser, or publish the repo with GitHub Pages (Settings → Pages → deploy from the `main` branch, root folder). The pages link to each other and share the files in `assets/`.

To check every layout for furniture that overlaps, crosses a wall or blocks a door, and that beds and wardrobes keep their real sizes, run:

```bash
node tests/layout-check.cjs assets/planner.js
```

The major add-on price ($75) is a placeholder; it isn't in the decks.
