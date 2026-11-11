const notes = [
  [
    'ownership-before-handover',
    'Before you take ownership of a web app',
    'Delivery',
    'Ask for a fresh install',
    'Run the project from its documentation in a new environment. Confirm database migrations, build commands and backups before the previous team leaves.',
    'Walk through the failure paths',
    'Try a failed submission, a lost connection and an expired login. The product should explain what happened and preserve the work a user can safely retry.',
    'Finish with an access inventory',
    'Record who owns the domain, repository, mail sender and hosting account. Transfer ownership and rotate shared credentials before sign-off.',
  ],
  [
    'permission-tests',
    'Three permission checks for a new API',
    'Security',
    'Start without a session',
    'Call a private endpoint without signing in. Confirm that it returns a deliberate denial and no private fields.',
    'Try the same action as another user',
    'Use two test accounts with separate records. Change the record identifier and verify that account A cannot read or modify account B’s data.',
    'Test the write path separately',
    'A protected page does not protect its API. Repeat the tests against create, update and delete operations, and record the expected status for each.',
  ],
  [
    'mobile-performance',
    'A practical mobile launch check',
    'Engineering',
    'Start with the first screen',
    'Load the page with a cold cache and a throttled connection. Identify which file delays the main headline or image.',
    'Make decoration optional',
    'Give canvases a static first frame, pause motion offscreen, and respect reduced-motion preferences. A visitor should be able to read and navigate before animation starts.',
    'Measure the real journey',
    'Test a low-end handset, submit a brief and open a case study. Repeat after a release and compare measurements from the same device and network.',
  ],
];

export const initialPosts = notes.map(([id, title, label, a, b, c, d, e, f]) => ({
  id,
  kind: 'post',
  title,
  label,
  body: [a, b, c, d, e, f].join('\n\n'),
  url: '',
  image: '',
  status: 'published',
  updated: 0,
}));

