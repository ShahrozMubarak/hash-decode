export const faq=[
 ['How much does a project cost?','We price the agreed scope. The number of workflows, integrations and review requirements all affect the quote. Our estimator gives you a starting range before you send a brief.'],
 ['How long does a build take?','We set milestones after reviewing your requirements and dependencies. If you have a launch date, include it in your brief so we can identify what fits the first release.'],
 ['Who owns the source code?','We agree source ownership and third-party licences in the proposal. Handover covers repository access, deployment instructions and the accounts you need to run the software.'],
 ['Can you review an existing application?','Yes. Share the stack, the issue and who can authorise access. We agree the review boundaries before testing and provide findings your team can act on.'],
 ['What happens after launch?','We agree a support window and point of contact before delivery. Ongoing maintenance, upgrades and additional features can be scoped separately.']
] as const;
export const processSteps=[
 ['Discuss','Tell us who uses the software and what gets in their way.'],
 ['Plan','Agree the scope, decisions, handover and milestones.'],
 ['Build','Review working increments against the original brief.'],
 ['Test','Check the main workflows, permissions and failure paths.'],
 ['Deliver','Take ownership of the release, repository and runbook.'],
 ['Support','Use the agreed support route for fixes and follow-up work.']
] as const;
export const capabilities=[
 ['platforms','Web platforms','Accessible websites and web apps with a content system your team can run.'],
 ['products','Custom software','Turn a product idea into a working application, from data model to interface.'],
 ['security','Security audits and hardening','Review access controls, examine exposed inputs and prioritise fixes.'],
 ['tools','Business tools','Replace repeated manual steps with dashboards, integrations and clear workflows.']
] as const;
export const stack=[['react','React'],['typescript','TypeScript'],['nodedotjs','Node.js'],['cloudflare','Cloudflare'],['python','Python']] as const;
