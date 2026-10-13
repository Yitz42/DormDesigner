# DormDesigner

Example website for DormDesigner, a dorm setup and decor rental service (ENTR 200, Group A).

**Team:** Patrick Gray, Ayooluwatomi Akeju, Yitzchuk Rosenblat, Yuvan Vijayabaskar, De'Angelo Pierce

## What's on the site

- Hero and problem statement
- How it works, in four steps
- Packages: Essentials ($450/yr), Basic ($850/yr), Deluxe ($1,500/yr)
- Room planner: pick a UMBC floor plan, a package, a color palette and a major add-on, and see the room decorated on the plan
  - **Just my bed** decorates only the bed you pick (tap a bed on the plan); roommates' beds stay as the university provides them. **Whole suite** decorates every bed plus shared rooms and shows the suite total.
  - **3D view** turns the same floor plan into a model you can rotate and zoom. It loads three.js from cdnjs the first time someone opens it.
- Comparison with DIY retail and basic rental
- Who it's for, our values, and a demo reservation form (nothing is sent)

Plans are drawn to scale: each one is stretched to the overall size measured with the measuring tool in UMBC's 360° tours (Walker Avenue uses the room sizes printed on its plan, and Potomac is scaled from its extra-long twin beds). Beds use UMBC's real frame size (about 40" × 84"), and the 3D view uses real heights: 8 ft ceilings, 80" doors, 30" desks with hutches in the halls.

The floor plans are redrawn from UMBC Residential Life's published plans: Susquehanna/Patapsco/Chesapeake, Potomac, Erickson/Harbor double suite, Harbor single suite, Terrace/Hillside, West Hill and Walker Avenue. DormDesigner isn't affiliated with UMBC.

## Run it

It's one static file with no build step. Open `index.html` in a browser, or publish the repo with GitHub Pages (Settings → Pages → deploy from the `main` branch, root folder).

The major add-on price ($75) is a placeholder; it isn't in the decks.
