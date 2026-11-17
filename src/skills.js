// Pact skills library: skill-specific milestone ladders plus links to reliable learning sites.
// Nothing here is a made-up course. Resources are either (a) well-known free/open providers, linked at their
// home page or their own search page for the skill, or (b) searches for real local classes.
// To add a skill: copy one entry in PLANS, change `match`, `steps` and `resources`.

const enc = encodeURIComponent;
const U = {
  coursera: (q) => `https://www.coursera.org/search?query=${enc(q)}`,
  edx: (q) => `https://www.edx.org/search?q=${enc(q)}`,
  futurelearn: (q) => `https://www.futurelearn.com/search?q=${enc(q)}`,
  khan: (q) => `https://www.khanacademy.org/search?page_search_query=${enc(q)}`,
  youtube: (q) => `https://www.youtube.com/results?search_query=${enc(q + ' full course beginner')}`,
  udemy: (q) => `https://www.udemy.com/courses/search/?q=${enc(q)}`,
  skillshare: (q) => `https://www.skillshare.com/en/search?query=${enc(q)}`,
  codecademy: (q) => `https://www.codecademy.com/search?query=${enc(q)}`,
  mitocw: (q) => `https://ocw.mit.edu/search/?q=${enc(q)}`,
  alison: () => 'https://alison.com',
  openlearn: () => 'https://www.open.edu/openlearn/free-courses',
  nationalCareers: () => 'https://nationalcareers.service.gov.uk/find-a-course',
  local: (q, city) => `https://www.google.com/search?q=${enc(`${q} ${city ? 'near ' + city : 'near me'}`)}`,
  meetup: (q) => `https://www.meetup.com/find/?keywords=${enc(q)}`,
  eventbrite: (q, city, country) => (country === 'United Kingdom' && city) ? `https://www.eventbrite.co.uk/d/united-kingdom--${enc(String(city).toLowerCase().replace(/\s+/g, '-'))}/${enc(String(q).toLowerCase().replace(/\s+/g, '-'))}/` : `https://www.eventbrite.com/d/online/${enc(String(q).toLowerCase().replace(/\s+/g, '-'))}/`,
  wikibooks: (q) => `https://en.wikibooks.org/w/index.php?search=${enc(q)}`
};

// A resource: [provider, title, cost, one-line description, url builder or fixed url]
const R = {
  coursera: (what) => ['Coursera', `${what || '{skill}'} courses on Coursera`, 'Free to audit, certificate paid', 'University and industry courses; you can audit most for free.', (q) => U.coursera(what || q)],
  edx: (what) => ['edX', `${what || '{skill}'} courses on edX`, 'Free to audit, certificate paid', 'University-run courses (Harvard, MIT and others).', (q) => U.edx(what || q)],
  futurelearn: (what) => ['FutureLearn', `${what || '{skill}'} courses on FutureLearn`, 'Free short courses, upgrade optional', 'UK-based short courses from universities and institutions.', (q) => U.futurelearn(what || q)],
  khan: (what) => ['Khan Academy', `${what || '{skill}'} on Khan Academy`, 'Free', 'Free lessons and practice, no sign-up needed to watch.', (q) => U.khan(what || q)],
  youtube: (what) => ['YouTube', `Beginner ${what || '{skill}'} tutorials`, 'Free', 'Search for full beginner courses; check the video length and reviews first.', (q) => U.youtube(what || q)],
  udemy: (what) => ['Udemy', `${what || '{skill}'} courses on Udemy`, 'Paid (frequent sales)', 'Check ratings, reviews and the preview before buying.', (q) => U.udemy(what || q)],
  skillshare: (what) => ['Skillshare', `${what || '{skill}'} classes on Skillshare`, 'Free trial, then subscription', 'Short project-based creative classes.', (q) => U.skillshare(what || q)],
  codecademy: (what) => ['Codecademy', `${what || '{skill}'} on Codecademy`, 'Free tier, Pro paid', 'Interactive lessons in the browser.', (q) => U.codecademy(what || q)],
  mitocw: (what) => ['MIT OpenCourseWare', `${what || '{skill}'} on MIT OpenCourseWare`, 'Free', 'Real MIT lecture notes, problem sets and videos.', (q) => U.mitocw(what || q)],
  alison: (what) => ['Alison', `${what || '{skill}'} on Alison`, 'Free (certificate paid)', 'Free short courses on practical and workplace skills.', (q) => U.alison(what || q)],
  openlearn: () => ['OpenLearn (Open University)', 'Free courses from the Open University', 'Free', 'Browse the free catalogue and filter by subject and level.', () => U.openlearn()],
  nationalCareers: () => ['National Careers Service (UK)', 'Find a course near you', 'Some free or funded', 'Official UK course finder, including funded adult courses.', () => U.nationalCareers()],
  local: (what) => ['Local classes', `Find ${what || '{skill} classes'} near you`, 'Varies', 'Searches for real classes, clubs and studios in your city.', (q, city) => U.local(what || (q + ' classes'), city)],
  meetup: (what) => ['Meetup', `${what || '{skill}'} groups`, 'Mostly free', 'Find a group to practise with regularly.', (q) => U.meetup(what || q)],
  eventbrite: (what) => ['Eventbrite', `${what || '{skill}'} workshops and events`, 'Varies', 'One-off workshops and taster sessions.', (q, city, country) => U.eventbrite(what || q, city, country)],
  fixed: (provider, title, cost, blurb, url) => [provider, title, cost, blurb, () => url]
};

// steps: [title, fraction of the total time at which the step should be done]
const PLANS = [
  { id: 'guitar', label: 'Guitar', match: /\bguitar\b|ukulele|acoustic|fingerstyle/i,
    steps: [['Learn the parts of the guitar, how to hold it and how to tune it', 0.06], ['Play Em and Am cleanly, every string ringing out', 0.15], ['Learn the open chords A, D, E, G and C', 0.3], ['Change between two chords in time for one minute without stopping', 0.42], ['Play a four-chord song all the way through with a steady strum', 0.58], ['Learn a basic barre chord (F or B minor) and one simple riff', 0.75], ['Learn the minor pentatonic shape and play along to a backing track', 0.88], ['Record yourself playing one full song and listen back', 1]],
    resources: [R.fixed('JustinGuitar', 'JustinGuitar beginner course', 'Free', 'A free, structured beginner course with graded lessons and practice routines.', 'https://www.justinguitar.com'), R.youtube('guitar'), R.local('guitar lessons'), R.meetup('guitar')] },
  { id: 'piano', label: 'Piano and keyboard', match: /\bpiano\b|keyboard|keys\b/i,
    steps: [['Find middle C and learn the white and black key pattern', 0.06], ['Play a five-note scale in each hand separately', 0.16], ['Learn to read notes on the treble and bass clef', 0.3], ['Play a simple tune with the right hand, then the left hand', 0.45], ['Play hands together slowly on a short piece', 0.6], ['Learn the C, G and F major chords and play them as a progression', 0.75], ['Play one full piece at a steady tempo without stopping', 0.9], ['Record yourself and choose your next piece', 1]],
    resources: [R.youtube('piano'), R.skillshare('piano'), R.local('piano lessons'), R.fixed('Musescore', 'Free sheet music on MuseScore', 'Free and paid', 'A large library of arrangements, many at beginner level.', 'https://musescore.com/sheetmusic')] },
  { id: 'singing', label: 'Singing', match: /\bsing(ing)?\b|vocal|choir/i,
    steps: [['Learn breathing from the diaphragm and a simple warm-up routine', 0.1], ['Find your comfortable range by singing up and down a scale', 0.22], ['Match pitch with a piano app or tuner', 0.38], ['Learn one song all the way through, keeping to the pitch', 0.55], ['Record yourself and compare it with the original', 0.7], ['Sing for a friend or join a choir taster session', 0.88], ['Perform or share one song', 1]],
    resources: [R.youtube('singing lessons'), R.local('singing lessons or community choir'), R.skillshare('singing')] },
  { id: 'language', label: 'Learning a language', match: /\b(spanish|french|german|italian|portuguese|japanese|mandarin|chinese|korean|arabic|indonesian|bahasa|amharic|russian|dutch|turkish|hindi|urdu|swedish|polish|greek|language)\b/i,
    steps: [['Learn the alphabet, pronunciation and the 50 most common words', 0.1], ['Learn greetings and introduce yourself in {skill}', 0.2], ['Learn the present tense of the 20 most common verbs', 0.33], ['Hold a five-minute conversation with a tutor or language partner', 0.5], ['Read a short beginner story or article and note new words', 0.65], ['Watch a show or listen to a podcast in {skill} with subtitles', 0.78], ['Order food, ask directions or book something in {skill}', 0.9], ['Have a 15-minute conversation without switching to English', 1]],
    resources: [R.fixed('Duolingo', 'Duolingo daily practice', 'Free with ads', 'Short daily lessons that build a habit; good for the first months.', 'https://www.duolingo.com'), R.fixed('BBC Languages', 'BBC Languages', 'Free', 'Free taster courses and phrases for many languages.', 'https://www.bbc.co.uk/languages/'), R.fixed('italki', 'Find a tutor on italki', 'Paid per lesson', 'One-to-one lessons with teachers; trial lessons are cheap.', 'https://www.italki.com'), R.meetup('language exchange'), R.local('language')] },
  { id: 'python', label: 'Python', match: /\bpython\b/i,
    steps: [['Install Python and run your first script', 0.07], ['Learn variables, numbers, strings and printing', 0.15], ['Learn if-statements, loops and lists', 0.3], ['Write functions and use dictionaries', 0.45], ['Read and write a file; handle errors', 0.6], ['Use a library (for example pandas or requests) on real data', 0.75], ['Build a small project that solves a problem you have', 0.9], ['Put it on GitHub with a short README', 1]],
    resources: [R.fixed('CS50', 'CS50 Introduction to Programming with Python (Harvard)', 'Free', 'Harvard\'s free course with problem sets.', 'https://cs50.harvard.edu/python/'), R.fixed('Python.org', 'The official Python tutorial', 'Free', 'The reference beginner tutorial.', 'https://docs.python.org/3/tutorial/'), R.fixed('Kaggle Learn', 'Kaggle Learn: Python', 'Free', 'Short hands-on lessons in the browser.', 'https://www.kaggle.com/learn/python'), R.codecademy('Python')] },
  { id: 'webdev', label: 'Web development', match: /\b(web ?dev|website|html|css|javascript|typescript|react|front ?end|node)\b/i,
    steps: [['Build a plain HTML page with headings, links and images', 0.1], ['Style it with CSS: layout, colours and spacing', 0.22], ['Make it responsive for a phone screen', 0.34], ['Learn JavaScript variables, functions and the DOM', 0.5], ['Fetch data from a public API and show it on the page', 0.65], ['Build a small project (to-do list, quiz or portfolio)', 0.82], ['Publish it online (GitHub Pages or Cloudflare Pages)', 1]],
    resources: [R.fixed('freeCodeCamp', 'freeCodeCamp Responsive Web Design', 'Free', 'A full free curriculum with projects and certificates.', 'https://www.freecodecamp.org'), R.fixed('MDN', 'MDN Learn web development', 'Free', 'Mozilla\'s reference-quality tutorials.', 'https://developer.mozilla.org/en-US/docs/Learn'), R.fixed('The Odin Project', 'The Odin Project', 'Free', 'Project-based full-stack path.', 'https://www.theodinproject.com'), R.codecademy('web development')] },
  { id: 'data', label: 'Data analysis and machine learning', match: /machine learning|\bml\b|data (analy|sci)|\bsql\b|pandas|statistics|deep learning|\bai\b/i,
    steps: [['Refresh the maths you need: averages, spread, probability and straight-line fits', 0.1], ['Learn pandas: load, clean and summarise a real dataset', 0.25], ['Make clear charts that answer a question about the data', 0.38], ['Fit a simple model (linear regression) and check how well it works', 0.52], ['Learn train/test splits and why models overfit', 0.65], ['Try a classification model and compare two approaches', 0.78], ['Complete an end-to-end project on a public dataset and write up the result', 0.92], ['Share the notebook on GitHub or Kaggle', 1]],
    resources: [R.fixed('Kaggle Learn', 'Kaggle Learn: Pandas, ML and data visualisation', 'Free', 'Short hands-on courses using real datasets.', 'https://www.kaggle.com/learn'), R.coursera('machine learning'), R.fixed('fast.ai', 'Practical Deep Learning for Coders', 'Free', 'A well-regarded free course that starts with building things.', 'https://course.fast.ai'), R.mitocw('statistics')] },
  { id: 'excel', label: 'Excel and spreadsheets', match: /\bexcel\b|spreadsheet|google sheets/i,
    steps: [['Learn cells, formatting, sorting and filtering', 0.12], ['Write formulas: SUM, AVERAGE, IF and COUNTIF', 0.28], ['Use lookups (XLOOKUP or VLOOKUP) to join two tables', 0.45], ['Build a pivot table and a chart from raw data', 0.62], ['Clean messy data with text functions and Remove Duplicates', 0.78], ['Build a small budget or tracker with a summary page', 1]],
    resources: [R.fixed('Microsoft', 'Microsoft Excel training videos', 'Free', 'Official short lessons from Microsoft.', 'https://support.microsoft.com/en-gb/excel'), R.youtube('Excel'), R.alison('Excel')] },
  { id: 'cad', label: 'CAD and engineering software', match: /solidworks|\bcad\b|autocad|fusion 360|onshape|ansys|catia|inventor/i,
    steps: [['Learn the interface and sketch basic shapes with dimensions and constraints', 0.12], ['Make your first part with extrude and cut features', 0.25], ['Use fillets, patterns and revolves on a more complex part', 0.4], ['Assemble two or more parts with mates', 0.55], ['Produce a dimensioned engineering drawing', 0.7], ['Run a basic simulation or stress check on a part', 0.85], ['Model something real you could manufacture or 3D print', 1]],
    resources: [R.fixed('SOLIDWORKS', 'MySolidWorks tutorials and the built-in tutorials', 'Free', 'Official lessons; the in-app tutorials work offline.', 'https://my.solidworks.com'), R.fixed('Autodesk', 'Fusion free learning resources', 'Free', 'Official Autodesk tutorials.', 'https://www.autodesk.com'), R.youtube('SolidWorks')] },
  { id: 'matlab', label: 'MATLAB', match: /\bmatlab\b|simulink|octave/i,
    steps: [['Learn the desktop, variables, vectors and matrices', 0.12], ['Plot data and customise the figure', 0.25], ['Write scripts with loops and if-statements', 0.4], ['Write and call your own functions', 0.55], ['Solve an ODE or fit a curve to data', 0.7], ['Load a data file, analyse it and export results', 0.85], ['Finish a small project, such as a simple simulation', 1]],
    resources: [R.fixed('MathWorks', 'MATLAB Onramp', 'Free', 'MathWorks\' free two-hour interactive introduction.', 'https://matlabacademy.mathworks.com'), R.mitocw('MATLAB')] },
  { id: 'running', label: 'Running', match: /\brun(ning)?\b|5k|10k|couch to|marathon|parkrun|jogging/i,
    steps: [['Get shoes that fit and do your first easy run-walk of 20 minutes', 0.08], ['Run for 1 minute, walk for 90 seconds, repeat, three times in a week', 0.2], ['Run 5 minutes without stopping', 0.35], ['Run 10 to 15 minutes at an easy, talking pace', 0.5], ['Run for 20 minutes without stopping', 0.65], ['Run 5 km (try a local parkrun)', 0.8], ['Add one longer easy run and one short faster run in a week', 0.92], ['Pick your next target distance or race', 1]],
    resources: [R.fixed('NHS', 'NHS Couch to 5K', 'Free', 'The NHS\'s free 9-week beginner plan with audio coaching.', 'https://www.nhs.uk/better-health/get-active/'), R.fixed('parkrun', 'parkrun: free weekly 5 km', 'Free', 'Free timed runs every Saturday in parks around the world.', 'https://www.parkrun.com'), R.local('beginner running club')] },
  { id: 'strength', label: 'Strength training and gym', match: /\bgym\b|strength|weights|weightlift|lifting|bodybuild|powerlift|calisthenic|pull-?ups?|press-?ups?|push-?ups?/i,
    steps: [['Book a gym induction and learn the machines and free weights', 0.08], ['Learn the form for squat, hinge (deadlift), press and row using light weight', 0.2], ['Follow a simple full-body routine two or three times a week for two weeks', 0.38], ['Add small weight or reps each week and keep a training log', 0.55], ['Hit a first target (for example, bodyweight squat for 5 reps)', 0.72], ['Take a lighter week, then re-test your lifts', 0.86], ['Choose a programme for the next block', 1]],
    resources: [R.fixed('NHS', 'NHS strength and flex exercises', 'Free', 'Official guidance and beginner routines.', 'https://www.nhs.uk/live-well/exercise/'), R.youtube('beginner strength training'), R.local('gym induction or personal trainer')] },
  { id: 'climbing', label: 'Climbing and bouldering', match: /climb|boulder|abseil|belay/i,
    steps: [['Book an intro session at a climbing wall and learn the safety rules', 0.1], ['Learn how to fall and down-climb safely', 0.2], ['Complete the easiest grade on three different walls', 0.35], ['Learn to read a route before you climb it', 0.5], ['Climb two grades up from where you started', 0.68], ['Learn to belay and get signed off (if you want to rope climb)', 0.84], ['Set a goal such as a particular grade or an outdoor day', 1]],
    resources: [R.fixed('Climbing wall finder', 'Find a climbing wall near you', 'Varies', 'Search for indoor walls and intro sessions.', 'https://www.google.com/maps/search/climbing+wall'), R.meetup('climbing'), R.youtube('bouldering for beginners')] },
  { id: 'swimming', label: 'Swimming', match: /\bswim(ming)?\b|\bpool\b|freestyle|front crawl/i,
    steps: [['Get comfortable putting your face in the water and floating', 0.12], ['Learn to kick and glide on your front and back', 0.26], ['Swim one length of front crawl with breathing', 0.42], ['Swim four lengths without stopping', 0.6], ['Learn breaststroke or backstroke', 0.78], ['Swim 400 m (16 lengths) with short rests', 1]],
    resources: [R.fixed('Swim England', 'Swim England: find a class or a pool', 'Varies', 'Official lessons and pool finder.', 'https://www.swimming.org'), R.local('adult swimming lessons'), R.youtube('learn front crawl')] },
  { id: 'yoga', label: 'Yoga and mobility', match: /\byoga\b|pilates|stretching|mobility|flexib/i,
    steps: [['Try a 15-minute beginner flow and note how it feels', 0.12], ['Learn the basic poses: downward dog, warrior I and II, child\'s pose', 0.28], ['Practise three times a week for two weeks', 0.5], ['Attend a class and ask the teacher for tips', 0.68], ['Hold a balance pose for 30 seconds', 0.85], ['Build a 20-minute routine you can do on your own', 1]],
    resources: [R.fixed('Yoga with Adriene', 'Yoga With Adriene on YouTube', 'Free', 'Popular beginner-friendly free videos.', 'https://www.youtube.com/@yogawithadriene'), R.local('yoga class'), R.fixed('NHS', 'NHS 10-minute workouts', 'Free', 'Short exercise videos.', 'https://www.nhs.uk/better-health/get-active/')] },
  { id: 'cooking', label: 'Cooking and baking', match: /\bcook(ing)?\b|bak(e|ing)|recipe|meal prep|cuisine|kitchen/i,
    steps: [['Learn knife skills and how to season food as you cook', 0.12], ['Cook three simple dishes you can repeat (eggs, pasta sauce, a stir-fry)', 0.28], ['Learn to cook rice, potatoes and one vegetable well', 0.42], ['Cook one new recipe a week for three weeks', 0.6], ['Cook a full meal for friends, with everything ready at the same time', 0.78], ['Write down your five best recipes and adapt one to your taste', 1]],
    resources: [R.fixed('BBC Good Food', 'BBC Good Food beginner recipes and guides', 'Free', 'Tested recipes with step-by-step guides.', 'https://www.bbcgoodfood.com'), R.youtube('cooking basics'), R.local('cookery class')] },
  { id: 'drawing', label: 'Drawing and painting', match: /\bdraw(ing)?\b|sketch|paint(ing)?|illustrat|watercolou?r|\bart\b|procreate/i,
    steps: [['Gather basic materials and fill a page with lines, shapes and shading', 0.1], ['Draw simple objects from life: cube, sphere, cup', 0.25], ['Learn proportion and perspective with a one-point perspective drawing', 0.42], ['Do ten ten-minute sketches of everyday things', 0.58], ['Learn light and shadow on a still life', 0.74], ['Finish one piece you are happy to show', 0.9], ['Share it and ask for feedback', 1]],
    resources: [R.fixed('Drawabox', 'Drawabox', 'Free', 'A free, exercise-based course in the fundamentals of drawing.', 'https://drawabox.com'), R.skillshare('drawing'), R.local('life drawing or art class'), R.youtube('drawing basics')] },
  { id: 'photo', label: 'Photography', match: /photograph|camera|lightroom/i,
    steps: [['Learn your camera: aperture, shutter speed and ISO', 0.14], ['Shoot in manual for a week and review your keepers', 0.3], ['Learn composition: rule of thirds, leading lines, framing', 0.46], ['Shoot a theme of ten photos in the same place', 0.62], ['Learn to edit (crop, exposure, colour) in a free editor', 0.78], ['Print or publish a set of your best five', 1]],
    resources: [R.youtube('photography basics'), R.skillshare('photography'), R.local('photography course'), R.meetup('photography')] },
  { id: 'writing', label: 'Writing', match: /\bwrit(e|ing)\b|novel|blog|journal|creative writing|essay|copywriting/i,
    steps: [['Write for ten minutes a day for a week', 0.12], ['Decide what you want to write and who it is for, in one paragraph', 0.24], ['Write a rough first draft without editing', 0.5], ['Leave it for two days, then edit for structure', 0.68], ['Edit line by line and read it out loud', 0.82], ['Get feedback from one reader and share or submit it', 1]],
    resources: [R.futurelearn('creative writing'), R.coursera('writing'), R.fixed('Purdue OWL', 'Purdue OWL writing guides', 'Free', 'Clear guides to structure, grammar and referencing.', 'https://owl.purdue.edu/owl/purdue_owl.html'), R.meetup('writing group')] },
  { id: 'speaking', label: 'Public speaking and presenting', match: /public speaking|presenting|presentation|speech|toastmaster|confidence speaking/i,
    steps: [['Watch two excellent talks and note what they do well', 0.1], ['Write a two-minute talk with one clear message', 0.25], ['Practise it out loud and time it', 0.4], ['Record yourself on your phone and watch it back', 0.55], ['Give it to a friend or small group and ask for feedback', 0.72], ['Speak at a meeting, club or event', 0.9], ['Review what went well and set the next goal', 1]],
    resources: [R.fixed('Toastmasters', 'Toastmasters clubs', 'Membership fee', 'Find a local club where you practise regularly and get feedback.', 'https://www.toastmasters.org'), R.coursera('public speaking'), R.youtube('public speaking')] },
  { id: 'case', label: 'Consulting case interviews', match: /case interview|consulting|management consult|mckinsey|bain\b|bcg/i,
    steps: [['Learn the structure of a case interview and common case types', 0.12], ['Practise mental maths: percentages, growth and break-even', 0.28], ['Learn a profitability framework and apply it to three cases', 0.45], ['Do a market-sizing case and an estimation case', 0.6], ['Do five full cases out loud with a partner', 0.8], ['Do a timed mock with feedback, then fix your weak spots', 1]],
    resources: [R.fixed('McKinsey', 'McKinsey careers: interview and problem-solving test guidance', 'Free', 'Official guidance and practice material.', 'https://www.mckinsey.com/careers'), R.fixed('BCG', 'BCG careers: interview preparation', 'Free', 'Official interview preparation.', 'https://careers.bcg.com'), R.fixed('Bain', 'Bain careers: interview preparation', 'Free', 'Official guidance and practice cases.', 'https://www.bain.com/careers/')] },
  { id: 'interview', label: 'Interviews and CVs', match: /interview|\bcv\b|resume|cover letter|job application|assessment cent|graduate scheme|linkedin/i,
    steps: [['Write a one-page CV with measurable results for each role', 0.15], ['Tailor your CV and cover letter for one target role', 0.3], ['Prepare six stories using the STAR method (situation, task, action, result)', 0.5], ['Do a mock interview with a friend or careers service', 0.68], ['Research the employer and prepare three questions to ask them', 0.82], ['Apply to five roles and track them in a spreadsheet', 1]],
    resources: [R.fixed('Prospects', 'Prospects careers advice and interview tips', 'Free', 'UK graduate careers advice.', 'https://www.prospects.ac.uk'), R.fixed('National Careers Service', 'National Careers Service CV and interview help', 'Free', 'Official UK careers guidance.', 'https://nationalcareers.service.gov.uk/careers-advice'), R.youtube('interview preparation')] },
  { id: 'finance', label: 'Money, budgeting and investing', match: /budget|invest|personal finance|savings|pension|\bisa\b|stocks|money/i,
    steps: [['Write down your income and spending for one month', 0.15], ['Build a simple monthly budget and set a savings target', 0.3], ['Set up an emergency fund in an easy-access account', 0.5], ['Learn the basics of ISAs, pensions and fees', 0.68], ['Understand risk and diversification before you invest anything', 0.85], ['Review your plan and automate your savings', 1]],
    resources: [R.fixed('MoneyHelper', 'MoneyHelper (UK government-backed)', 'Free', 'Free, impartial guidance on budgeting, pensions and saving.', 'https://www.moneyhelper.org.uk'), R.fixed('MSE', 'MoneySavingExpert guides', 'Free', 'Practical UK money guides.', 'https://www.moneysavingexpert.com'), R.openlearn()] },
  { id: 'driving', label: 'Driving', match: /\bdriving\b|driv(e|er)'?s? licen[cs]e|theory test|learn to drive/i,
    steps: [['Apply for your provisional licence', 0.06], ['Book your theory test and practise hazard perception', 0.2], ['Pass your theory test', 0.38], ['Book regular lessons with a reviewed instructor', 0.5], ['Practise between lessons with an experienced driver', 0.68], ['Book your practical test when your instructor agrees you are ready', 0.85], ['Pass your practical test', 1]],
    resources: [R.fixed('GOV.UK', 'Apply for your first provisional driving licence', 'Fee applies', 'The official application.', 'https://www.gov.uk/apply-first-provisional-driving-licence'), R.fixed('GOV.UK', 'Book your theory test', 'Fee applies', 'The official booking service.', 'https://www.gov.uk/book-theory-test'), R.fixed('GOV.UK', 'Theory test practice', 'Free', 'Free official practice questions and hazard perception.', 'https://www.gov.uk/theory-test')] },
  { id: 'chess', label: 'Chess', match: /\bchess\b/i,
    steps: [['Learn how the pieces move and the special rules', 0.1], ['Learn the basic checkmates (queen and rook)', 0.25], ['Learn three opening principles and one simple opening', 0.4], ['Solve ten tactics puzzles a day for a week', 0.58], ['Play ten games and review your mistakes', 0.78], ['Learn the basic endgames (king and pawn)', 1]],
    resources: [R.fixed('Lichess', 'Lichess learn and practice (free)', 'Free', 'Free lessons, puzzles and games with no ads.', 'https://lichess.org/learn'), R.fixed('Chess.com', 'Chess.com lessons', 'Free tier, paid upgrade', 'Video lessons and puzzles.', 'https://www.chess.com/lessons'), R.local('chess club')] },
  { id: 'crafts', label: 'Knitting, sewing and crafts', match: /knit|crochet|sew(ing)?|embroider|pottery|ceramic|woodwork|craft/i,
    steps: [['Get the right materials and learn the basic technique', 0.15], ['Make a small practice piece (swatch, seam or test)', 0.3], ['Follow a beginner pattern for a simple first project', 0.55], ['Fix mistakes and learn how to finish neatly', 0.75], ['Make a second project of your own choice', 1]],
    resources: [R.youtube('beginner craft tutorial'), R.skillshare('crafts'), R.local('craft workshop'), R.eventbrite('craft workshop')] },
  { id: 'gardening', label: 'Gardening and plants', match: /garden(ing)?|plants?\b|allotment|grow(ing)? (veg|food)|houseplant/i,
    steps: [['Choose a spot and note how much sun it gets', 0.12], ['Pick three easy plants for the season (for example herbs, lettuce, sweet peas)', 0.28], ['Prepare the soil or compost and plant them', 0.45], ['Water and feed on a schedule and check for pests weekly', 0.65], ['Harvest or enjoy your first results', 0.85], ['Plan next season based on what worked', 1]],
    resources: [R.fixed('RHS', 'Royal Horticultural Society advice', 'Free', 'Trusted UK gardening advice by plant and season.', 'https://www.rhs.org.uk'), R.local('community garden or allotment'), R.youtube('beginner gardening')] },
  { id: 'meditation', label: 'Meditation and mindfulness', match: /meditat|mindful|breathing exercise/i,
    steps: [['Sit quietly and follow your breath for five minutes', 0.15], ['Practise at the same time every day for a week', 0.35], ['Try a guided session and a body scan', 0.55], ['Build up to ten or fifteen minutes', 0.8], ['Notice what changes and decide how to keep the habit', 1]],
    resources: [R.fixed('NHS', 'NHS mindfulness guidance', 'Free', 'Plain-English guide with a free audio practice.', 'https://www.nhs.uk/mental-health/'), R.youtube('guided meditation for beginners')] },
  { id: 'studying', label: 'Revision and exam technique', match: /revision|revise|exam|dissertation|thesis|study skills|essay plan|coursework/i,
    steps: [['List every topic and mark each red, amber or green', 0.1], ['Build a weekly timetable with short, regular study blocks', 0.22], ['Do past-paper questions for the weakest topics first', 0.45], ['Practise recalling without notes (flashcards or blank-page summaries)', 0.65], ['Do a full timed past paper under exam conditions', 0.82], ['Review mistakes and fix the last gaps', 1]],
    resources: [R.fixed('Coursera', 'Learning How to Learn (Coursera)', 'Free to audit', 'A popular course on study techniques that work.', 'https://www.coursera.org/learn/learning-how-to-learn'), R.khan('revision'), R.fixed('BBC Bitesize', 'BBC Bitesize revision', 'Free', 'Revision guides by subject and level.', 'https://www.bbc.co.uk/bitesize')] },
  { id: 'nuclear', label: 'Nuclear and energy engineering', match: /nuclear|reactor|energy systems|thermal hydraulics|power plant|decommission/i,
    steps: [['Revise the basics of fission, moderation, and criticality', 0.12], ['Learn the main reactor types (PWR, BWR, AGR, SMR) and how they differ', 0.28], ['Learn the safety principles: defence in depth and ALARP', 0.45], ['Read about the UK context: Sizewell C, Hinkley Point C, SMRs and decommissioning', 0.62], ['Work through one example calculation (neutron balance or heat transfer)', 0.78], ['Write a one-page summary of a technology you could discuss in an interview', 1]],
    resources: [R.fixed('IAEA', 'IAEA: nuclear power reactors and safety', 'Free', 'International Atomic Energy Agency\'s free educational material.', 'https://www.iaea.org'), R.fixed('World Nuclear Association', 'World Nuclear Association: information library', 'Free', 'Clear explanations of technologies and the industry.', 'https://world-nuclear.org'), R.fixed('Nuclear Institute', 'Nuclear Institute (UK) events and careers', 'Varies', 'The UK professional body, with events and early-career networks.', 'https://www.nuclearinst.com'), R.mitocw('nuclear engineering')] }
];

const GENERIC = {
  steps: [['Learn the basics of {skill} from one trusted source', 0.15], ['Do a first small practice exercise in {skill}', 0.3], ['Practise {skill} in three short sessions this week', 0.45], ['Build something small with {skill}', 0.65], ['Get feedback from someone who knows {skill}', 0.8], ['Fix your weakest spots in {skill}', 0.9], ['Show or share what you made with {skill}', 1]],
  resources: [R.youtube(''), R.coursera(''), R.futurelearn(''), R.local(''), R.meetup('')]
};

const clean = (s) => String(s || '').trim();
const fill = (t, skill) => t.replace(/\{skill\}/g, skill);

// Which curated plan fits this skill? Matches on the skill name first, then the goal text.
export const findSkillPlan = (name, goal) => {
  const n = clean(name), g = clean(goal);
  return PLANS.find(p => p.match.test(n)) || PLANS.find(p => p.match.test(g)) || null;
};
export const skillPlanLabel = (plan) => plan ? plan.label : '';

// Milestones for a plan, trimmed to `count` steps, each with a "target" label.
export const planMilestones = (plan, skillName, count, totalDays, toTarget) => {
  const src = (plan || GENERIC).steps;
  const n = Math.max(2, Math.min(count, src.length));
  // keep the first and last, and spread the rest evenly
  const idx = new Set([0, src.length - 1]);
  for (let k = 1; idx.size < n && k < src.length; k++) idx.add(Math.round((k * (src.length - 1)) / (n - 1)));
  for (let k = 0; idx.size < n && k < src.length; k++) idx.add(k);
  const chosen = [...idx].sort((a, b) => a - b).slice(0, n).map(i => src[i]);
  let prev = 0;
  return chosen.map(([title, f]) => {
    const days = Math.max(1, Math.round(totalDays * (f - prev))); prev = f;
    return { title: fill(title, clean(skillName) || 'this skill'), target: toTarget(days) };
  });
};

// Resource cards for the Courses section: real providers, real links.
export const planResources = (plan, skillName, city, country) => {
  const q = clean(skillName) || 'learning';
  return (plan || GENERIC).resources.map((r, i) => {
    const [provider, title, cost, blurb, url] = r;
    return { id: `res_${(plan ? plan.id : 'generic')}_${i}`, provider, title: fill(title, q), cost, blurb, url: url(q, city, country) };
  });
};
export const SKILL_PLAN_LABELS = PLANS.map(p => p.label);
