"""
Content for the three service one-pagers.

Trimmed from the originals. The old versions ran three pages each and
repeated the website almost verbatim — a leave-behind should be shorter than
the site, not the same length. Every step lost its explanatory sentence where
the title already carried the meaning, and the marketing preamble went
entirely.

Retained Search went from eight steps to four, matching the process the
website and the pitch deck both use. Three descriptions of the same process
that don't agree is worse than one that does.
"""

GOLD = "#E1A13F"
INK = "#05070A"
CHAR = "#11171F"
RULE = "#D8D4CC"
MUTED = "#6B7681"
BODY = "#2A3340"

DOCS = [
    {
        "slug": "retained-search",
        "eyebrow": "Retained Search",
        "title": "The search behind\na stronger hire.",
        "lede": "A dedicated, confidential search for leadership and specialist roles "
                "where the right person shapes what comes next.",
        "sections": [
            {
                "kick": "The process",
                "heading": "Four steps, no mystery.",
                "intro": "Each engagement is shaped by the role, the market, and the people "
                         "who will work alongside the hire.",
                "steps": [
                    ("01", "We learn your business",
                     "Your company, your leadership culture, and what success in this role "
                     "actually looks like. We align on the mandate before approaching anyone."),
                    ("02", "We go to the market, quietly",
                     "We map the relevant companies and talent pools, then approach high "
                     "performers who are employed and would never answer a job posting."),
                    ("03", "We hand you a shortlist, not a pile",
                     "Three or four finalists, assessed on track record, trajectory, role fit "
                     "and motivation — with the context to evaluate them properly."),
                    ("04", "We stay in it to the close",
                     "We coordinate interviews, carry feedback both ways, and support the "
                     "offer through to acceptance and the start of the transition."),
                ],
            },
            {
                "kick": "Where it fits",
                "heading": "When the hire has to be right.",
                "intro": None,
                "columns": [
                    ("Roles", "C-suite and regional leadership, practice leaders, specialist "
                              "technical roles, and senior business development."),
                    ("Discretion", "Exclusive engagement, confidential outreach, and no "
                                   "approach made without an agreed mandate."),
                    ("Attention", "A limited number of searches at a time, so yours is run by "
                                  "someone senior rather than delegated down."),
                    ("Depth", "Twenty-five years in insurance and nothing else. No ramp-up "
                              "on your time."),
                ],
            },
        ],
    },
    {
        "slug": "contingent-submittal",
        "eyebrow": "Contingent Submittal",
        "title": "The right introduction,\nat the right moment.",
        "lede": "A success-based way to meet proven insurance talent, useful when someone "
                "exceptional in our network fits a current opening.",
        "sections": [
            {
                "kick": "Our approach",
                "heading": "Specialist reach, flexible terms.",
                "intro": None,
                "steps": [
                    ("01", "Understand the opening",
                     "The role, the team, and the experience that would make someone "
                     "effective in your organization specifically."),
                    ("02", "Identify relevant talent",
                     "Drawn from our insurance relationships, our legacy database, and "
                     "current market activity — not from active applicants."),
                    ("03", "Evaluate before introducing",
                     "We assess background and genuine interest, then present a clear "
                     "summary for your consideration."),
                    ("04", "Support the decision",
                     "We coordinate conversations and stay close through feedback, "
                     "negotiation and placement."),
                ],
            },
            {
                "kick": "Where it fits",
                "heading": "A practical way to meet proven talent.",
                "intro": None,
                "columns": [
                    ("Roles", "Producers, account managers, underwriters, claims "
                              "professionals, operations and other specialist positions."),
                    ("No upfront fee", "The fee is tied to a successful placement. Evaluate "
                                       "an introduction before committing to anything."),
                    ("A broader view", "Our existing relationships surface people well "
                                       "beyond whoever happens to be applying."),
                    ("Through the close", "Candidate context, arranged conversations, and "
                                          "support through the offer process."),
                ],
            },
        ],
    },
    {
        "slug": "ma-consulting",
        "eyebrow": "M&A Consulting",
        "title": "Grow by team,\nnot just by hire.",
        "lede": "People-focused support for acquisitions, team moves and organizational "
                "transitions in the insurance industry.",
        "sections": [
            {
                "kick": "Growth options",
                "heading": "The people side of expansion.",
                "intro": "We work with leaders to assess talent, preserve continuity, and "
                         "bring high-performing teams into the next stage of growth.",
                "columns": [
                    ("Acquisitions", "Leadership integration, talent retention and "
                                     "organizational design after a deal closes."),
                    ("Lift-outs", "Recruit an established team or business unit whose people "
                                  "already know how to perform together."),
                    ("Fold-ins", "Help an acquired group join an existing organization while "
                                 "protecting relationships and continuity."),
                    ("Roll-ins", "Support consolidation, leadership realignment, and the move "
                                 "into a broader platform."),
                ],
            },
            {
                "kick": "How we work",
                "heading": "Talent strategy through change.",
                "intro": None,
                "steps": [
                    ("01", "Clarify the growth goal",
                     "The target capability, the market opportunity, and the leadership "
                     "outcome the organization is actually seeking."),
                    ("02", "Evaluate the people picture",
                     "Team strengths, leadership fit, the relationships that matter, and the "
                     "talent the next stage will require."),
                    ("03", "Plan the transition",
                     "Roles, communication, retention, and how an incoming team works within "
                     "the existing structure."),
                    ("04", "Support integration",
                     "We stay close to stakeholders as leadership and teams settle into the "
                     "new shape."),
                ],
            },
        ],
    },
]

CONTACT = {
    "email": "info@mgmtglobal.com",
    "phone": "469-458-6469",
    "site": "mgmtglobal.com",
    "location": "Carrollton, Texas",
}
