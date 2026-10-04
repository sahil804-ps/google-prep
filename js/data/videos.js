// Hand-picked concept videos (YouTube IDs found with tools/find_videos.py and checked for embedding).
// Keys: DSA topic names, basics ids (b1..), system design lessons (sdl..), test design lessons (tdl..).
(function (root) {
  function v(id, title, channel, lang) {
    return { id: id, title: title, channel: channel, lang: lang };
  }
  var VIDEOS = {
    'Arrays & Hashing': [v('ea8BRGxGmlA', 'Hash Table in Python', 'codebasics', 'English'), v('KEs5UyBJ39g', 'Hashing, maps, collisions', 'take U forward', 'Hindi + English')],
    'Two Pointers': [v('QzZ7nmouLTI', 'Two Pointers in 7 minutes', 'AlgoMasterIO', 'English'), v('B2L4mAglJZA', 'Two Pointer technique', 'Gate Smashers', 'Hindi')],
    'Sliding Window': [v('y2d0VHdvfdc', 'Sliding Window in 7 minutes', 'AlgoMasterIO', 'English'), v('9kdHxplyl5I', 'Sliding Window and 2 Pointers templates', 'take U forward', 'Hindi + English')],
    Stack: [v('DtJVwbbicjQ', 'Monotonic Stack in 6 minutes', 'AlgoMasterIO', 'English'), v('e7XQLtOQM3I', 'Next Greater Element', 'take U forward', 'Hindi + English')],
    'Binary Search': [v('V_T5NuccwRA', 'What is Binary Search', "Jenny's Lectures", 'English'), v('TbbSJrY5GqQ', 'Binary Search theory + code', 'Apna College', 'Hindi')],
    'Linked List': [v('R9PTBwOzceo', 'Introduction to Linked List', 'Neso Academy', 'English'), v('LyuuqCVkP5I', 'Introduction to Linked List', 'Shradha Khapra', 'Hindi')],
    Trees: [v('jmy0LaGET1I', 'Binary Tree traversals (BFS, DFS)', 'take U forward', 'Hindi + English')],
    Tries: [v('zIjfhVPRZCg', 'Tries in 5 minutes', 'HackerRank', 'English'), v('dBGUmUQhjaM', 'Implement a Trie', 'take U forward', 'Hindi + English')],
    'Heap / Priority Queue': [v('XycnarZEBvQ', 'Heaps visually explained', 'ByteQuest', 'English'), v('uuot9ItgTEI', 'Introduction to Heap', 'Gate Smashers', 'Hindi')],
    Backtracking: [v('p9m2LHBW81M', 'Backtracking template', 'Bitflip', 'English'), v('DKCbsiDBN6c', 'Introduction to Backtracking', 'Abdul Bari', 'English')],
    Graphs: [v('pcKY4hjDrxk', 'BFS and DFS', 'Abdul Bari', 'English'), v('-tgVpUgsQ5k', 'Breadth-First Search', 'take U forward', 'Hindi + English')],
    'Advanced Graphs': [v('EFg3u_E6eHU', "How Dijkstra's algorithm works", 'Spanning Tree', 'English'), v('XB4MIexjvY0', "Dijkstra's algorithm", 'Abdul Bari', 'English')],
    '1-D Dynamic Programming': [v('oNoILrFOx2k', "A beginner's guide to DP", 'Matt Guest', 'English'), v('tyB0ztf0DNY', 'DP intro: memoization, tabulation', 'take U forward', 'Hindi + English')],
    '2-D Dynamic Programming': [v('sSno9rV8Rhg', 'Longest Common Subsequence', 'Abdul Bari', 'English')],
    Greedy: [v('lfQvPHGtu6Q', 'Greedy algorithms explained', 'Tech With Tim', 'English'), v('ARvQcqJ_-NY', 'Greedy method introduction', 'Abdul Bari', 'English')],
    Intervals: [v('dzNIPX7HY6A', 'Merge Intervals with diagrams', 'Nikhil Lohia', 'English'), v('IexN60k62jo', 'Merge overlapping intervals', 'take U forward', 'Hindi + English')],
    'Math & Geometry': [v('3Zv-s9UUrFM', 'Spiral traversal of a matrix', 'take U forward', 'Hindi + English')],
    'Bit Manipulation': [v('H_NCHm3wAMI', 'Binary numbers and bit manipulation (Python)', 'Greg Hogg', 'English'), v('qQd-ViW7bfk', 'Introduction to Bit Manipulation', 'take U forward', 'Hindi + English')],

    b1: [v('BgLTDT03QtU', 'Big-O notation for coding interviews', 'NeetCode', 'English'), v('5T0SiJocPCI', 'Time complexity for coding interviews', 'Apna College', 'Hindi')],
    b2: [v('Q83nN97LVOU', 'A better way to understand recursion', 'Alex Hyett', 'English'), v('RC7jznvizAk', 'Easiest way to learn recursion', 'Engineering Digest', 'Hindi')],
    b3: [v('tn9hxD8gx2M', 'How Merge Sort works', 'Gate Smashers', 'Hindi'), v('tWCaFVJMUi8', 'How Quick Sort works', 'Gate Smashers', 'Hindi')],
    b4: [v('yuws7YK0Yng', 'Prefix Sum in 4 minutes', 'AlgoMasterIO', 'English'), v('qmlrMrIObvs', 'What is Prefix Sum', 'Newton School', 'Hindi')],
    b5: [v('0K_eZGS5NsU', 'Python for coding interviews', 'NeetCode', 'English')],

    sdl1: [v('i7twT3x5yv8', 'System design interview: step-by-step guide', 'ByteByteGo', 'English'), v('CtmBGH8MkX4', '5 tips for system design interviews', 'Gaurav Sen', 'English')],
    sdl2: [v('xpDnVSmNFX0', 'Horizontal vs vertical scaling', 'Gaurav Sen', 'English')],
    sdl3: [v('sCR3SAVdyCc', 'What is a load balancer?', 'IBM Technology', 'English'), v('TavIqNcnwSA', 'Load balancer in system design', 'Gate Smashers', 'Hindi')],
    sdl4: [v('dGAgxozNWFE', 'Cache systems every developer should know', 'ByteByteGo', 'English'), v('1NngTUYPdpI', 'Caching in system design interviews', 'Hello Interview', 'English')],
    sdl5: [v('_Ss42Vb1SU4', 'SQL vs NoSQL in 4 minutes', 'Exponent', 'English')],
    sdl6: [v('wXvljefXyEo', 'Database sharding and partitioning', 'Arpit Bhayani', 'English'), v('XP98YCr-iXQ', 'What is database sharding?', 'Anton Putra', 'English')],
    sdl7: [v('oUJbuFMyBDk', 'What is a message queue?', 'Gaurav Sen', 'English'), v('1ISRd0bS714', 'Message queues in system design interviews', 'Hello Interview', 'English')],
    sdl8: [v('BHqjEjzAicA', 'CAP theorem simplified', 'ByteByteGo', 'English'), v('VdrEq0cODu4', 'CAP theorem in interviews', 'Hello Interview', 'English')],
    sdl9: [v('veAb1fSp1Lk', 'tRPC, gRPC, GraphQL or REST', 'Software Developer Diaries', 'English'), v('uH0SxYdsjv4', 'gRPC vs REST vs GraphQL', 'Anton Putra', 'English')],
    sdl10: [v('Akri1BlGp10', 'SLO vs SLI vs SLA vs error budget', 'Tech Tutorials with Piyush', 'English')],

    tdl1: [v('1Xbt3n4phFg', 'What is the testing pyramid?', 'The Test Lead', 'English'), v('YaXJeUkBe4Y', '5 types of testing', 'Alex Hyett', 'English')],
    tdl2: [v('aId-WLZnvkw', 'How to write unit tests the right way', 'Cody Engel', 'English')],
    tdl3: [v('NPp2pvhGbkM', 'Test doubles: mocks, stubs and fakes', 'The Theory Of Code', 'English')],
    tdl4: [v('P1Hv2sUPKeM', 'Boundary value analysis and equivalence partitioning', 'Guru99', 'English'), v('uydAyjqTSiw', 'Equivalence partitioning with example', 'Software and Testing Training', 'English')],
    tdl5: [v('isI1c0eGSZ0', 'When to unit, E2E and integration test', 'The PrimeTime', 'English')],
    tdl6: [v('CwfohDaRpig', '3 reasons for flaky tests and how to fix them', 'Artem Bondar', 'English')],
    tdl7: [v('1er2cjUq1UI', 'What is continuous integration?', 'IBM Technology', 'English'), v('scEDHsr3APg', 'CI/CD in 100 seconds', 'Fireship', 'English')],
    tdl8: [v('AJa2B-twtG4', 'What are feature flags?', 'IBM Technology', 'English')],
    tdl10: [v('RYsBgP-RwVI', 'What is API testing?', 'Postman', 'English')],
    tdl11: [v('hhMUE0_vAs4', 'How to test your ML models', 'Goku Mohandas', 'English'), v('LbX4X71-TFI', 'How to evaluate ML models', 'AssemblyAI', 'English')],
  };
  if (typeof module !== 'undefined') module.exports = VIDEOS;
  else root.VIDEOS = VIDEOS;
})(this);
