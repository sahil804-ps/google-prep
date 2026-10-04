(function (root) {
  var BOOK = 'https://abseil.io/resources/swe-book/html/';
  var PRIMER = 'https://github.com/donnemartin/system-design-primer';
  var TESTBLOG = 'https://testing.googleblog.com/';

  function yt(q) {
    return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
  }

  var TD_CHECKLIST = [
    'Clarified requirements and assumptions first',
    'Listed functional test cases (happy path)',
    'Edge / boundary cases (empty, null, max size, unicode, time zones)',
    'Negative / invalid input and error handling',
    'Non-functional: performance, load, security, accessibility, localisation',
    'Test levels: unit vs integration vs end-to-end, and why',
    'What to automate vs test manually, and test data strategy',
    'How tests run in CI and how flaky tests are handled',
    'Metrics / monitoring in production',
    'Prioritised the list (what you would test first)',
  ];

  var tdLessons = [
    { id: 'tdl1', title: 'How Google thinks about testing', notes: '## Key ideas\n- Testing is owned by engineers, not a separate phase\n- Test pyramid: ~80% unit, ~15% integration, ~5% end-to-end\n- Test size (small/medium/large = resources used) vs test scope (how much code)\n- Goal is confidence to change code fast\n## Practise\nExplain the test pyramid out loud in 2 minutes, in English.', read: [{ label: 'SWE at Google - Ch 11 Testing Overview', url: BOOK + 'ch11.html' }], video: yt('test pyramid explained google testing') },
    { id: 'tdl2', title: 'Unit testing done right', notes: '## Key ideas\n- Test behaviour, not implementation\n- Tests should be clear, complete and concise (DAMP over DRY)\n- One behaviour per test; name it `test_<behaviour>_<condition>`\n- Arrange / Act / Assert\n- Avoid logic (loops, ifs) inside tests', read: [{ label: 'SWE at Google - Ch 12 Unit Testing', url: BOOK + 'ch12.html' }], video: yt('unit testing best practices behaviour not implementation') },
    { id: 'tdl3', title: 'Test doubles: fakes, stubs, mocks', notes: '## Key ideas\n- Prefer real implementations, then fakes, then stubs/mocks\n- Mocks that verify interactions make tests brittle\n- A fake is a lightweight working implementation (in-memory DB)\n- Dependency injection makes code testable\n## Practise\nExplain the difference between a fake, a stub and a mock with one example each.', read: [{ label: 'SWE at Google - Ch 13 Test Doubles', url: BOOK + 'ch13.html' }], video: yt('mock vs stub vs fake explained') },
    { id: 'tdl4', title: 'Test case design techniques', notes: '## Techniques\n- Equivalence partitioning: one value per class of input\n- Boundary value analysis: min-1, min, min+1, max-1, max, max+1\n- Decision tables for combinations of rules\n- State transition testing for workflows\n- Pairwise testing to cut combinations\n## Practise\nApply all five to a "password rules" validator.', read: [{ label: 'Google Testing Blog', url: TESTBLOG }], video: yt('equivalence partitioning boundary value analysis decision table') },
    { id: 'tdl5', title: 'Larger tests: integration and end-to-end', notes: '## Key ideas\n- Larger tests catch config, integration and real-world issues\n- They are slower and flakier -> keep few, high value\n- Hermetic environments, test data management\n- Record/replay, canarying, A/B diff testing\n- Probers in production', read: [{ label: 'SWE at Google - Ch 14 Larger Testing', url: BOOK + 'ch14.html' }], video: yt('integration testing vs end to end testing strategy') },
    { id: 'tdl6', title: 'Flaky tests', notes: '## Causes\n- Timing / async waits, order dependence, shared state\n- Network and external services, time zones, randomness\n- Resource limits on CI machines\n## Handling\n- Detect: rerun and track pass rate per test\n- Quarantine above a threshold, file a bug with owner\n- Fix root cause: explicit waits, hermetic data, fakes\n## Your story\nYou built flaky detection in qaforge-mcp - use it as an example.', read: [{ label: 'Google Testing Blog (search "flaky")', url: TESTBLOG + 'search?q=flaky' }], video: yt('flaky tests root causes and how to fix them') },
    { id: 'tdl7', title: 'Continuous integration and test infrastructure', notes: '## Key ideas\n- Presubmit (fast, before merge) vs post-submit (larger tests)\n- Test selection: run only tests affected by the change\n- Hermetic builds, caching, sharding tests across machines\n- Culprit finding: which commit broke the build (bisect)', read: [{ label: 'SWE at Google - Ch 23 Continuous Integration', url: BOOK + 'ch23.html' }], video: yt('continuous integration test sharding test selection at scale') },
    { id: 'tdl8', title: 'Continuous delivery and release safety', notes: '## Key ideas\n- Small frequent releases, feature flags\n- Canary releases and gradual rollout with automatic rollback\n- Monitoring and SLOs as part of testing\n- Testing in production safely', read: [{ label: 'SWE at Google - Ch 24 Continuous Delivery', url: BOOK + 'ch24.html' }], video: yt('canary release feature flags rollback explained') },
    { id: 'tdl9', title: 'Performance, load and reliability testing', notes: '## Key ideas\n- Latency percentiles (p50, p95, p99), throughput, error rate\n- Load vs stress vs soak vs spike tests\n- Baselines and regression detection in CI\n- Chaos / fault injection: kill a server, add latency', read: [{ label: 'System Design Primer - performance & scalability', url: PRIMER + '#performance-vs-scalability' }], video: yt('load testing vs stress testing p99 latency explained') },
    { id: 'tdl10', title: 'Testing APIs, mobile and security', notes: '## Key ideas\n- API: contract tests, schema validation, auth, rate limits, idempotency\n- Mobile: device matrix, offline, battery, permissions, upgrades\n- Security: OWASP Top 10, input validation, authz checks\n- Accessibility basics (WCAG)', read: [{ label: 'Google Testing Blog', url: TESTBLOG }], video: yt('api testing strategy contract testing explained') },
    { id: 'tdl11', title: 'Testing ML and AI systems', notes: '## Key ideas\n- No single correct output -> evaluate with metrics and golden sets\n- Data validation, training/serving skew\n- Bias / fairness slices, regression on model updates\n- LLM: evaluation sets, red-teaming, guardrails\n## Your story\nAI-QA-Script and qaforge-mcp are good examples to mention.', read: [{ label: 'Google Testing Blog', url: TESTBLOG }], video: yt('how to test machine learning systems') },
  ];

  var tdPrompts = [
    ['Test a function `is_palindrome(s)`', 'Write test cases for a function that returns true if a string is a palindrome.'],
    ['Test a login page', 'Design the testing for a web login page with email + password + "remember me".'],
    ['Test a URL shortener', 'Design tests for a service that turns long URLs into short links and redirects.'],
    ['Test a vending machine', 'Design tests for a vending machine (coins, selection, change, out of stock).'],
    ['Test Google Search autocomplete', 'How would you test the autocomplete suggestions in the Google Search box?'],
    ['Test an elevator system', 'Design tests for an elevator controller in a 20-floor building with 3 elevators.'],
    ['Test a calculator app', 'Design tests for a mobile calculator app.'],
    ['Test a rate limiter', 'Design tests for an API rate limiter (100 requests per minute per user).'],
    ['Test Google Maps directions', 'How would you test the "directions" feature in Google Maps?'],
    ['Test a file upload service', 'Design tests for a service like Google Drive upload (large files, resume, types).'],
    ['Test a payment checkout', 'Design tests for an online checkout and payment flow.'],
    ['Test a chat app', 'Design tests for a messaging app like Google Chat (delivery, order, offline, groups).'],
    ['Design a flaky test detector', 'Design a system that finds and quarantines flaky tests across thousands of CI runs.'],
    ['Design a distributed test runner', 'Design infrastructure that runs 100,000 tests per commit in under 10 minutes.'],
    ['Test a cache (LRU)', 'Design tests for an in-memory LRU cache library.'],
    ['Test YouTube video playback', 'How would you test video playback on YouTube across devices and networks?'],
    ['Test Gmail spam filter', 'How would you test a spam classifier for Gmail?'],
    ['Test a REST API for todos', 'Design tests for a CRUD REST API (create, read, update, delete todos).'],
    ['Test a date/time library', 'Design tests for a function that adds N days to a date in any time zone.'],
    ['Design a test results dashboard', 'Design a system that collects test results from all teams and shows trends.'],
    ['Test a ride-sharing app', 'Design tests for a ride-sharing app (matching, pricing, GPS, payments).'],
    ['Test an LLM chatbot', 'How would you test an AI assistant that answers customer support questions?'],
  ].map(function (p, i) {
    return { id: 'tdp' + (i + 1), title: p[0], prompt: p[1], checklist: TD_CHECKLIST };
  });

  var SD_CHECKLIST = [
    'Clarified functional requirements',
    'Non-functional: scale (users, QPS), latency, availability, consistency',
    'Back-of-the-envelope numbers (storage, bandwidth)',
    'API design (endpoints / methods)',
    'Data model and database choice (SQL vs NoSQL, why)',
    'High-level diagram: clients, load balancer, services, DB, cache, queue',
    'Deep dive on the hardest part',
    'Bottlenecks, single points of failure, scaling plan',
    'How you would test and monitor it',
  ];

  var sdLessons = [
    { id: 'sdl1', title: 'How to approach a design interview', notes: '## Framework (45 min)\n1. Requirements (5 min)\n2. Estimates (5 min)\n3. API + data model (5 min)\n4. High-level design (10 min)\n5. Deep dive (15 min)\n6. Wrap-up: bottlenecks, testing, monitoring (5 min)', read: [{ label: 'System Design Primer - how to approach', url: PRIMER + '#how-to-approach-a-system-design-interview-question' }], video: yt('system design interview framework step by step') },
    { id: 'sdl2', title: 'Scalability basics', notes: '## Key ideas\n- Vertical vs horizontal scaling\n- Stateless services behind a load balancer\n- Latency vs throughput\n- Numbers every engineer should know', read: [{ label: 'System Design Primer - scalability', url: PRIMER + '#performance-vs-scalability' }], video: yt('gaurav sen horizontal vs vertical scaling') },
    { id: 'sdl3', title: 'Load balancing', notes: '## Key ideas\n- L4 vs L7 load balancers\n- Round robin, least connections, consistent hashing\n- Health checks, failover', read: [{ label: 'System Design Primer - load balancer', url: PRIMER + '#load-balancer' }], video: yt('gaurav sen load balancing consistent hashing') },
    { id: 'sdl4', title: 'Caching', notes: '## Key ideas\n- Where: client, CDN, app cache, DB cache\n- Strategies: cache-aside, write-through, write-back\n- Eviction: LRU, TTL\n- Problems: stale data, thundering herd', read: [{ label: 'System Design Primer - cache', url: PRIMER + '#cache' }], video: yt('caching strategies system design explained') },
    { id: 'sdl5', title: 'Databases: SQL vs NoSQL', notes: '## Key ideas\n- ACID vs BASE\n- Indexes, replication (leader/follower)\n- When to choose key-value, document, wide-column, graph', read: [{ label: 'System Design Primer - database', url: PRIMER + '#database' }], video: yt('sql vs nosql system design interview') },
    { id: 'sdl6', title: 'Sharding and partitioning', notes: '## Key ideas\n- Horizontal partitioning by key\n- Consistent hashing to add/remove nodes\n- Hot keys and rebalancing', read: [{ label: 'System Design Primer - sharding', url: PRIMER + '#sharding' }], video: yt('database sharding explained system design') },
    { id: 'sdl7', title: 'Message queues and async processing', notes: '## Key ideas\n- Decouple producers and consumers\n- At-least-once delivery, idempotent consumers\n- Pub/sub, dead-letter queues, back pressure', read: [{ label: 'System Design Primer - asynchronism', url: PRIMER + '#asynchronism' }], video: yt('message queue system design kafka explained') },
    { id: 'sdl8', title: 'CAP theorem and consistency', notes: '## Key ideas\n- Under a network partition choose consistency or availability\n- Strong vs eventual consistency\n- Quorum reads/writes', read: [{ label: 'System Design Primer - CAP', url: PRIMER + '#cap-theorem' }], video: yt('CAP theorem explained simply') },
    { id: 'sdl9', title: 'APIs and communication', notes: '## Key ideas\n- REST vs gRPC vs GraphQL\n- Pagination, idempotency keys, versioning\n- Rate limiting (token bucket)', read: [{ label: 'System Design Primer - communication', url: PRIMER + '#communication' }], video: yt('rest vs grpc vs graphql system design') },
    { id: 'sdl10', title: 'Reliability and observability', notes: '## Key ideas\n- SLI / SLO / SLA, error budgets\n- Logs, metrics, traces\n- Redundancy, retries with backoff, circuit breakers', read: [{ label: 'Google SRE book (free)', url: 'https://sre.google/sre-book/table-of-contents/' }], video: yt('SLI SLO SLA error budget explained') },
    { id: 'sdl11', title: 'Designing test infrastructure', notes: '## Key ideas\n- Test orchestration, sharding, retries\n- Result storage and flakiness analytics\n- Device farms / browser grids\n- This is the "system design" most likely in a SWE-Test loop', read: [{ label: 'SWE at Google - Ch 23 CI', url: BOOK + 'ch23.html' }], video: yt('design a distributed test execution system') },
  ];

  var sdPrompts = [
    'Design a URL shortener (like bit.ly)',
    'Design a rate limiter',
    'Design a key-value store',
    'Design a news feed',
    'Design a chat system',
    'Design a notification system',
    'Design a web crawler',
    'Design Google Drive / file storage',
    'Design a CI system that runs tests for every commit',
    'Design YouTube (upload + watch)',
    'Design a device lab for testing Android apps at scale',
  ].map(function (t, i) {
    return { id: 'sdp' + (i + 1), title: t, prompt: t + '. Talk through it in 35 minutes, then write your summary.', checklist: SD_CHECKLIST };
  });

  var STAR = 'Situation (1-2 lines) -> Task (your responsibility) -> Action (what YOU did, 60% of the answer) -> Result (outcome, learning).';
  var behavioral = [
    'Tell me about yourself (75 seconds).',
    'Why Google? Why a test / SDET role?',
    'Tell me about a time you found a critical bug late in a release.',
    'Tell me about a disagreement with a developer or manager. How did you handle it?',
    'Tell me about a time you improved a process or tool for your team.',
    'Tell me about a failure and what you learned.',
    'Tell me about a time you had to learn something new quickly.',
    'Tell me about a time you helped a teammate or mentored someone.',
    'Tell me about a time you had to work with unclear requirements.',
    'Tell me about a time you made a decision with incomplete data.',
    'Tell me about something you built that you are proud of (qaforge-mcp / AI-QA-Script).',
  ].map(function (q, i) {
    return { id: 'beh' + (i + 1), title: q, prompt: q, tips: STAR + '\nGoogleyness = humble, collaborative, comfortable with ambiguity, does the right thing for users.' };
  });

  var RESOURCES = [
    { group: 'Google hiring', items: [
      { label: 'How Google hires (official)', url: 'https://www.google.com/about/careers/applications/how-we-hire/' },
      { label: 'Google Tech Dev Guide', url: 'https://techdevguide.withgoogle.com/' },
    ] },
    { group: 'DSA', items: [
      { label: 'NeetCode roadmap', url: 'https://neetcode.io/roadmap' },
      { label: "Striver's A2Z sheet", url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2' },
      { label: 'VisuAlgo (animations)', url: 'https://visualgo.net/en' },
      { label: 'Python Tutor (see your code run)', url: 'https://pythontutor.com/visualize.html' },
    ] },
    { group: 'Testing', items: [
      { label: 'Software Engineering at Google (free book)', url: 'https://abseil.io/resources/swe-book' },
      { label: 'Google Testing Blog', url: TESTBLOG },
    ] },
    { group: 'System design', items: [
      { label: 'System Design Primer', url: PRIMER },
      { label: 'ByteByteGo', url: 'https://bytebytego.com/' },
      { label: 'Google SRE book', url: 'https://sre.google/sre-book/table-of-contents/' },
      { label: 'Gaurav Sen (YouTube)', url: yt('Gaurav Sen system design') },
    ] },
  ];

  var DESIGN = {
    tdLessons: tdLessons,
    tdPrompts: tdPrompts,
    sdLessons: sdLessons,
    sdPrompts: sdPrompts,
    behavioral: behavioral,
    resources: RESOURCES,
    yt: yt,
  };
  if (typeof module !== 'undefined') module.exports = DESIGN;
  else root.DESIGN = DESIGN;
})(this);
