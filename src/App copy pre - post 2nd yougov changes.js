import React, { useState, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import proposalsData from './proposals_by_category.json';
import { v4 as uuidv4 } from 'uuid';
import logo from './assets/logo.png';
import Airtable from 'airtable';
import {
  WhatsappShareButton,
  WhatsappIcon,
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon
} from 'react-share';

const airtableBase = new Airtable({ apiKey: 'patMsVAhp1Thpnxb2.65350b995395f62481b01efcdc9def813d84199bf71d97075014fcead71eec1a' }).base('appBtoRXEUDlndqrJ');

const buckets = [
  'Critical to Me & Others',
  'Good Idea',
  'Not Sure',
  'Dislike It',
  'Hate It',
];

const categoryOrder = [
  'Economic Mobility and Growth',
  'K-12 Education',
  'Healthcare',
  'Energy Policy',
  'Taxes',
  'Federal Spending & Debt',
  
];

const categoryColors = {
  'Economic Mobility and Growth': '#4a6ab2',
  'K-12 Education': '#46af93',
  'Healthcare': '#cdc04b',
  'Energy Policy': '#bd5aa7',
  'Taxes': '#bd4f4f',
  'Federal Spending & Debt': '#7c4fbd',
  
};

const categoryDescriptions = {
  'Economic Mobility and Growth': `THE PROBLEM: 77% of Americans believe the economy benefits powerful interests at their expense. People on the bottom half of the ladder have indeed been losing relative ground for decades. `,

  'K-12 Education': `THE PROBLEM: Our educational attainment has long been among the worst in the developed world. Since Covid, academic achievement has fallen further.`,

  'Healthcare': `THE PROBLEM: The US spends 18% of GDP on healthcare. Other developed countries spend 10%. Yet our health is the worst in the developed world. 

  We thereby squander at least $2.3 trillion each year; boosting the national debt; and shortchanging long-term investments in education, skills training and economic opportunity.`,

  'Energy Policy': `THE PROBLEM: Current energy policies are contradictory and economically wasteful, subsidizing both fossil fuels and renewables. America thereby fritters away hundreds of billions on energy, while extreme weather keeps increasing, irreparably harming millions of Americans, the economy and the environment.`,

'Taxes': `THE PROBLEM: Politicians use the tax code to favor their strongest supporters, which reduces the tax base, encourages economically dubious investments, and boosts the national debt.`,

  'Federal Spending & Debt': `THE PROBLEM: The US government spends $6 per senior for every $1 on a child under 18; favors consumption over investment; and directs tax breaks and benefits to favored interests with little regard for cost-effectiveness. 
  
  As a result, the federal debt exceeds 100 percent of GDP, and is clearly headed higher.`

};

function App() {
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [introStep, setIntroStep] = useState(1);
  const [assignments, setAssignments] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [formData, setFormData] = useState({ fname: '', lname: '', email: '', zip: ''});
  const [submitted, setSubmitted] = useState(false);
  const [reflectionStep, setReflectionStep] = useState(2);
  const [sessionId, setSessionId] = useState(null);
  const [showPackagePopup, setShowPackagePopup] = useState(false);
  const [showDirectionPopup, setShowDirectionPopup] = useState(false);
  const APP_VERSION = 'General V2'; // or 'v1-students', 'v1-donors', etc.
  const packageRef = React.useRef(null);
const directionRef = React.useRef(null);
const [isSubmittingQ2, setIsSubmittingQ2] = useState(false);
const [isSubmittingFinalForm, setIsSubmittingFinalForm] = useState(false);

useEffect(() => {
  if (showPackagePopup && packageRef.current) {
    packageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}, [showPackagePopup]);

useEffect(() => {
  if (showDirectionPopup && directionRef.current) {
    directionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}, [showDirectionPopup]);
  const [aspirationAnswers, setAspirationAnswers] = useState({
    economic: { important: null, progress: null },
    education: { important: null, progress: null },
    healthcare: { important: null, progress: null },
    debt: { important: null, progress: null },
    energy: { important: null, progress: null },
    taxes: { important: null, progress: null },
  });
  const [reflectionAnswers, setReflectionAnswers] = useState({
    q2: '',
    q3: ''
    
  });
  useEffect(() => {
    // Auto-collapse categories when all proposals in that category are assigned
    categoryOrder.forEach(category => {
      const proposals = proposalsData[category] || [];
      const allAssigned = proposals.every(p => assignments[p.id]);
      if (allAssigned && expandedCategories[category]) {
        setExpandedCategories(prev => ({
          ...prev,
          [category]: false
        }));
      }
    });
  }, [assignments, expandedCategories]);
  

  // Generate session_id when the component mounts
  useEffect(() => {
    const session_id = uuidv4();
    setSessionId(session_id);
    console.log('Generated session_id on mount:', session_id);  // Debug log
  }, []);


  const handleAssign = (proposalId, bucket) => {
    if (submitted) return;
    setAssignments(prev => ({ ...prev, [proposalId]: bucket }));
  };

  const handleUnassign = (proposalId) => {
    if (submitted) return;
    setAssignments(prev => {
      const newAssignments = { ...prev };
      delete newAssignments[proposalId];
      return newAssignments;
    });
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const reflection_q3 = null;  // reflection_q3 will be null initially

  // Use the pre-generated session_id from the state
  const session_id = sessionId;  // Use the pre-generated session_id from the state

  console.log('Using session_id for initial submission:', session_id);  // Debug log

  const assignmentArray = Object.entries(assignments).map(([id, bucket]) => {
    const proposal = Object.values(proposalsData).flat().find(p => p.id.toString() === id);
    const category = Object.entries(proposalsData).find(([cat, list]) =>
      list.some(p => p.id.toString() === id)
    )?.[0];

    return {
      proposal_id: parseInt(id),
      title: proposal?.title || '',
      category,
      bucket,
      fname: null,  // Set fname to null here (since it's not available yet)
      lname: null,  // Set lname to null here (since it's not available yet)
      email: null,  // Set email to null here (since it's not available yet)
      zip: null,  // Set email to null here (since it's not available yet)
      submitted_at: new Date().toISOString(),
      // reflection_q1 removed
      reflection_q2: reflectionAnswers.q2.toString(),
      reflection_q3,  // reflection_q3 is null
      session_id  // Include session_id here
    };
  });

  const payload = {
    session_id,  // Ensure session_id is included here
    fname: null,  // Empty fname
    lname: null,  // Empty lname
    email: null,  // Empty email
    zip: null,  // Empty email
    assignment: JSON.stringify(assignmentArray),
    // reflection_q1 removed
    reflection_q2: reflectionAnswers.q2.toString(),
    reflection_q3,  // reflection_q3 is null
    submitted_at: new Date().toISOString(),
  };

  const submitInitialReflection = async () => {
    console.log('Session ID:', session_id);
    console.log('Assignment Array:', JSON.stringify(assignmentArray, null, 2));
    console.log('Payload being sent to Airtable:', JSON.stringify(payload, null, 2));
  
    try {
      await airtableBase('submissions').create([
        {
          fields: {
            session_id,
            fname: null,
            lname: null,
            email: null,
            assignment: JSON.stringify(assignmentArray),
            reflection_q2: reflectionAnswers.q2.toString(),
            reflection_q3,
            submitted_at: new Date().toISOString(),
            version: APP_VERSION,  // Add this line
          },
        },
      ]);
      console.log('Initial reflection submitted to Airtable.');
    } catch (err) {
      console.error('Error submitting reflection to Airtable:', err);
    }
  };
  
  // Call it only when needed, like this:
  // DO NOT auto-submit on mount. Only submit from a controlled event.

  const handleFinalSubmit = async (e) => {
  e.preventDefault();
  setIsSubmittingFinalForm(true);

  const { fname, lname, email, zip } = formData;
  const session_id = sessionId;

  if (!session_id) {
    console.error('Missing session_id:', { session_id });
    setIsSubmittingFinalForm(false);
    return;
  }

  try {
    await airtableBase('details').create([
      {
        fields: {
          session_id,
          fname,
          lname,
          email,
          zip,
        },
      },
    ]);
    console.log('Details submission successful');
    setSubmitted(true);
  } catch (err) {
    console.error('Error inserting details into Airtable:', err);
  } finally {
    setIsSubmittingFinalForm(false);
  }
};

  const isAssigned = (proposalId) => assignments.hasOwnProperty(proposalId);
  const totalAssigned = Object.keys(assignments).length;
  const totalProposals = Object.values(proposalsData).flat().length;
  const progressPercent = (totalAssigned / totalProposals) * 100;
  const showForm = totalAssigned === totalProposals && !submitted;

  return (
    <>
      {showIntroModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-start justify-center overflow-y-auto min-h-screen pt-10">
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-2xl p-4 sm:p-6 text-lg text-gray-800 space-y-4">
          {introStep === 1 && (
  <>
  <p className="!text-2xl font-bold text-center">
  <strong>Grand Bargain App</strong>
</p>
<p className="text-center mb-2">
  <strong>You Can Make a Historical Difference</strong>
</p>
  <p>Americans are more polarized than ever in our lifetimes – yet 96% of us agree that one or more of the following goals are critical to our own lives:</p>
    <p>
  <strong>Greater economic opportunity & growth</strong><br />
  <strong>Schools that enable our kids to reach their potential</strong><br />
  <strong>More effective & affordable healthcare</strong><br />
  <strong>Less national debt</strong><br />
  <strong>Efficient, clean & reliable energy</strong><br />
  <strong>A fairer, simpler tax code</strong>
</p>
    {/*  <div className="overflow-x-auto max-h-[350px] sm:max-h-[none] overflow-y-auto">
  <table className="w-full text-sm text-left text-gray-700 border mt-4">
        <thead className="bg-gray-100 text-xs uppercase">
          <tr>
            <th className="px-4 py-2">Aspirations</th>
            <th className="px-4 py-2 text-center">Important to Me?</th>
            <th className="px-4 py-2 text-center">Expect Congress to Act?</th>
          </tr>
        </thead>
        <tbody>
        {[
  { key: 'economic', label: 'Boosting economic opportunity & growth' },
  { key: 'education', label: 'Reforming education so students reach their potential' },
  { key: 'healthcare', label: 'Making healthcare more effective and less costly' },
  { key: 'debt', label: 'Lowering the national debt' },
  { key: 'energy', label: 'Promoting more efficient, cleaner and reliable energy' },
  { key: 'taxes', label: 'Making the tax code fairer and simpler' },
].map(({ key, label }) => (
  <tr key={key} className="border-t">
    <td className="px-4 py-2">{label}</td>
    <td className="px-4 py-2 text-center space-x-2">
      <button
        className={`px-2 py-1 rounded text-xs ${
          aspirationAnswers[key]?.important === true
            ? 'bg-[#142d95] text-white'
            : 'bg-gray-200'
        }`}
        onClick={() =>
          setAspirationAnswers(prev => ({
            ...prev,
            [key]: { ...prev[key], important: true }
          }))
        }
      >
        Y
      </button>
      <button
        className={`px-2 py-1 rounded text-xs ${
          aspirationAnswers[key]?.important === false
            ? 'bg-[#142d95] text-white'
            : 'bg-gray-200'
        }`}
        onClick={() =>
          setAspirationAnswers(prev => ({
            ...prev,
            [key]: { ...prev[key], important: false }
          }))
        }
      >
        N
      </button>
    </td>
    <td className="px-4 py-2 text-center space-x-2">
      <button
        className={`px-2 py-1 rounded text-xs ${
          aspirationAnswers[key]?.progress === true
            ? 'bg-[#142d95] text-white'
            : 'bg-gray-200'
        }`}
        onClick={() =>
          setAspirationAnswers(prev => ({
            ...prev,
            [key]: { ...prev[key], progress: true }
          }))
        }
      >
        Y
      </button>
      <button
        className={`px-2 py-1 rounded text-xs ${
          aspirationAnswers[key]?.progress === false
            ? 'bg-[#142d95] text-white'
            : 'bg-gray-200'
        }`}
        onClick={() =>
          setAspirationAnswers(prev => ({
            ...prev,
            [key]: { ...prev[key], progress: false }
          }))
        }
      >
        N
      </button>
    </td>
  </tr>
))}
        </tbody>
      </table>
  
    </div>*/}

    <div className="text-right mt-4">
    <button
  className="bg-[#142d95] text-white px-4 py-2 rounded text-sm"
  onClick={async () => {
    setIntroStep(2); // move to the next step

// COMMENTED OUT: Submitting intro reflections to Supabase
// try {
//   const { error } = await supabase.from('introreflections').insert([
//     {
//       session_id: sessionId,
//       intro_reflections: aspirationAnswers
//     }
//   ]);

//   if (error) {
//     console.error('Error saving intro reflections:', error);
//   } else {
//     console.log('Intro reflections saved');
//   }
// } catch (err) {
//   console.error('Unexpected error saving intro reflections:', err);
// }
  }}
>
  Next
</button>
    </div>
  </>
)}

{introStep === 2 && (
  <>
    <p><strong>We nearly all share these aspirations,</strong> yet our political system puts them out of reach. Congress enacts each law, on each issue, to satisfy the majority party's supporters on that one issue.</p>
    <p>Each bill thereby contradicts most others, wasting trillions of dollars and letting our chronic problems grow worse.</p>
    <div className="text-right mt-4">
      <button className="bg-[#142d95] text-white px-4 py-2 rounded text-sm" onClick={() => setIntroStep(3)}>
        Next
      </button>
    </div>
  </>
)}

{introStep === 3 && (
  <>
    <p><strong>To end this dysfunction, the Grand Bargain Project team</strong> gathered ideas from various sources, distilling them into 36 practical reforms that will:</p>
    
    <div className="leading-snug mt-[-0.5rem] font-bold">
  <p className="m-0">Yield major progress in these six areas</p>
  <p className="m-0">Work well together</p>
  <p className="m-0">Boost efficiency and lower costs</p>
  <p className="m-0">Significantly advance each American’s aspirations</p>
</div>
    <div className="text-right mt-4">
      <button className="bg-[#142d95] text-white px-4 py-2 rounded text-sm" onClick={() => setIntroStep(4)}>
        Next
      </button>
    </div>
  </>
)}

{introStep === 4 && (
  <>
    <p><strong>Our purpose now is to refine the reforms to advance your goals.</strong></p>
    <p>To that end, the next screens will ask you to rate each reform, and then evaluate the total package.</p>
    <p>Our ambition is for over 75% of citizens, including many who differ from you, to agree on the end result.</p>
    <p>Then, despite of our differences, we can tell everyone in Washington:</p>
   <p><strong><em>Move this package forward – now – or we'll find someone who will.</em></strong></p>

    <div className="text-right">
      <button className="bg-[#142d95] text-white px-4 py-2 rounded text-sm" onClick={() => setShowIntroModal(false)}>
        Please Begin
        </button>
            </div>
          </>
        )}
    </div>
  </div>

  
)}
<div className="p-6 font-sans bg-white text-gray-800 min-h-screen">
  <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
    <img src={logo} alt="Grand Bargain Project" className="h-12 sm:h-14" />
    <h1 className="text-2xl sm:text-3xl font-bold text-[#142d95]">
      Grand Bargain App
    </h1>
  </div>

  {!submitted && totalAssigned < totalProposals && (
  <p className="bg-yellow-100 text-sm font-regular mb-4 text-center">
    <strong>FOR DEMO ONLY - NOT YET FOR PUBLIC RELEASE.</strong>
    </p> 
)}

  {!submitted && totalAssigned < totalProposals && (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
    <div className="text-sm text-gray-600">
      {totalAssigned} / {totalProposals} sorted
    </div>
    <button
      onClick={() => setAssignments({})}
      className="bg-red-100 text-red-700 px-4 py-1 text-sm rounded hover:bg-red-200 transition"
    >
      RESET ALL
    </button>
  </div>
)}

      <div className="w-full h-2 bg-gray-200 rounded mb-6">
        <div
          className="h-full bg-[#142d95] rounded"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {!submitted && totalAssigned < totalProposals && (
  <div className="text-xl font-regular mb-4 text-center border border-gray-300 rounded-md p-4 bg-gray-50 w-fit mx-auto space-y-4">
    <p>At the bottom of the page, you will see the 6 policy areas, each in a different color.</p> 
    <p><strong>By clicking on each bar, you will see:</strong></p>
    <p>Description of the basic problem</p> 
    <p>Overall description of the Grand Bargain proposals</p> 
    <p>Description of <em>each</em> proposal</p> 
    <p><strong>You will then have two options:</strong></p> 
    <p>
      You can classify<span className="bg-blue-100 rounded px-1">all the proposals</span>in each area into one of 5 categories.
    </p> 
    <p>Or you can classify <em>each proposal</em> into one of the 5 categories.</p> 
    <p>If any are unclear or don't resonate with you, click <em>Not Sure</em> and move to the next line.</p> 
  </div>
)}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {buckets.map(bucket => (
          <div
            key={bucket}
            className="bg-[#f9f9fc] border border-[#101761] rounded-lg shadow p-3 flex-1 min-w-[180px]"
          >
            <h2 className="text-sm font-semibold text-[#101761] mb-2 text-center">
              {bucket}
            </h2>
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {Object.entries(assignments)
                .filter(([_, b]) => b === bucket)
                .map(([id]) => {
                  const proposal = Object.values(proposalsData).flat().find(p => p.id.toString() === id);
                  if (!proposal) return null;
                  const category = Object.entries(proposalsData).find(([cat, list]) =>
                    list.some(p => p.id.toString() === id)
                  )?.[0];
                  const bg = categoryColors[category] || '#eee';
                  return (
                    <div
                      key={id}
                      className="p-2 rounded text-xs shadow-sm border border-gray-300 flex justify-between items-start gap-2"
                      style={{ backgroundColor: `${bg}26` }}
                    >
                      <span>{proposal.title}</span>
                      {!submitted && totalAssigned < totalProposals && (
                        <button
                          onClick={() => handleUnassign(id)}
                          className="text-gray-500 hover:text-red-500"
                          title="Remove from bucket"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>


      {showForm && reflectionStep !== 0 && (
  <div className="bg-green-50 border border-green-200 p-4 rounded mb-6">
    <div className="bg-white p-4 rounded shadow-sm">

    {reflectionStep === 2 && (
  <div className="space-y-4 text-lg font-medium text-gray-800 mb-4">
    <p>Each of the 36 reforms above have been around for a decade or more. Congress has enacted none. It is very unlikely to do so now.</p>
    <p>To change that situation, we need to find a total package that 75% or more of voters will support.</p>
    <p>Lawmakers who wanted to keep their seats would then need to act.</p>
    <p>So, please look at the reforms you most want. They are now out of reach.</p>
    <p>Then look at the parts you dislike. They are the price for the parts you want.</p>
    <p>Do you expect to be offered a better deal?</p>
    <p>So, which would you choose: This Grand Bargain or the country&#39;s current direction?</p>

    <div className="flex gap-4">
            <button
  className={`px-4 py-2 rounded text-sm ${
    reflectionAnswers.q2 === true
      ? 'bg-[#142d95] text-white'
      : 'bg-gray-300 hover:bg-[#142d95] hover:text-white'
  }`}
  disabled={reflectionAnswers.q2 !== '' || isSubmittingQ2}
  onClick={async () => {
    if (reflectionAnswers.q2 !== '' || isSubmittingQ2) return;

    setIsSubmittingQ2(true);
    try {
      await airtableBase('submissions').create([
        {
          fields: {
            session_id: sessionId,
            assignment: JSON.stringify(assignmentArray),
            reflection_q2: "true", 
            reflection_q3: '',
            submitted_at: new Date().toISOString(),
            version: APP_VERSION,
          },
        },
      ]);
      setReflectionAnswers(prev => ({ ...prev, q2: true }));
      setReflectionStep(0);
      setShowPackagePopup(true);
    } catch (err) {
      console.error('Error submitting reflection to Airtable:', err);
    } finally {
      setIsSubmittingQ2(false);
    }
  }}
>
  {isSubmittingQ2 ? 'Submitting...' : 'Grand Bargain'}
</button>

<button
  className={`px-4 py-2 rounded text-sm ${
    reflectionAnswers.q2 === false
      ? 'bg-[#142d95] text-white'
      : 'bg-gray-300 hover:bg-[#142d95] hover:text-white'
  }`}
  disabled={reflectionAnswers.q2 !== '' || isSubmittingQ2}
  onClick={async () => {
    if (reflectionAnswers.q2 !== '' || isSubmittingQ2) return;

    setIsSubmittingQ2(true);
    try {
      setReflectionAnswers(prev => ({ ...prev, q2: false }));
      setReflectionStep(3);
    } finally {
      setIsSubmittingQ2(false);
    }
  }}
>
  {isSubmittingQ2 ? 'Submitting...' : 'Current Direction'}
</button>
          </div>
        </div>
      )}

      {reflectionStep === 3 && (
        <div>
          <p className="mb-4 text-lg font-medium text-gray-800">
          What changes would get you to support the total package - that you think more than 75% of the
country would accept?
          </p>
          <textarea
            className="w-full border border-gray-300 rounded p-2 text-sm mb-4"
            rows={4}
            placeholder="Your answer..."
            value={reflectionAnswers.q3}
            onChange={e =>
              setReflectionAnswers(prev => ({ ...prev, q3: e.target.value }))
            }
          />
          <button
            className="bg-[#142d95] text-white px-4 py-2 rounded text-sm"
            onClick={async () => {
              const assignmentArray = Object.entries(assignments).map(([id, bucket]) => {
                const proposal = Object.values(proposalsData).flat().find(p => p.id.toString() === id);
                const category = Object.entries(proposalsData).find(([cat, list]) =>
                  list.some(p => p.id.toString() === id)
                )?.[0];
                return {
                  proposal_id: parseInt(id),
                  title: proposal?.title || '',
                  category,
                  bucket,
                  fname: formData.fname,
                  lname: formData.lname,
                  email: formData.email,
                  submitted_at: new Date().toISOString()
                };
              });

              try {
                await airtableBase('submissions').create([
                  {
                    fields: {
                      session_id: sessionId,
                      assignment: JSON.stringify(assignmentArray),
                      reflection_q2: reflectionAnswers.q2.toString(),
                      reflection_q3: reflectionAnswers.q3.toString(),
                      submitted_at: new Date().toISOString(),
                      version: APP_VERSION,  // Add this line
                    },
                  },
                ]);
                setReflectionStep(0);
                setShowDirectionPopup(true);
              } catch (err) {
                console.error('Error submitting Q3 reflection to Airtable:', err);
              }
            }}
          >
            Submit
          </button>
        </div>
      )}

    </div>
  </div>
)}
{showPackagePopup && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-start justify-center overflow-y-auto min-h-screen pt-40">
    <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-2xl p-4 sm:p-6 text-lg text-gray-800 space-y-4">
    <div className="bg-white p-4 rounded shadow-sm">
      {/* Display the message at the top */}
      {!submitted && (
  <>
    <p className="text-xl font-bold text-gray-800 mb-4">
    You see the value in the Grand Bargain. Join us!
</p>
<p className="text-xl italic text-gray-700">
Sign our petition that will go to Congress and the Administration
<br /><br />
You will recieve our newsletter 
<br /><br />
You will become part of this national movement
</p>

    <div className="h-4" /> {/* Spacer */}
  </>
)}

      {/* Email Submission Form */}
      {!submitted && (
        <form onSubmit={handleFinalSubmit} className="space-y-4">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label htmlFor="fname" className="text-sm font-medium text-gray-800">First Name*</label>
              <input
                id="fname"
                name="fname"
                type="text"
                value={formData.fname}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                required
              />
            </div>

            <div className="flex-1">
              <label htmlFor="lname" className="text-sm font-medium text-gray-800">Last Name*</label>
              <input
                id="lname"
                name="lname"
                type="text"
                value={formData.lname}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                required
              />
            </div>

            <div className="flex-1">
              <label htmlFor="zip" className="text-sm font-medium text-gray-800">Zip</label>
              <input
                id="zip"
                name="zip"
                type="text"
                value={formData.zip}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"

              />
            </div>
            </div>

            <div className="flex-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-800">Email*</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                required
              />
            </div>
      

          <button
            type="submit"
            className="w-full bg-[#142d95] text-white p-2 rounded mt-4"
          >
            Submit
          </button>
          <p className="text-[10px] text-gray-500 mt-3 leading-snug">
  By signing this petition, you accept the{' '}
  <a
    href="https://www.grandbargainproject.org/copy-of-data-privacy"
    target="_blank"
    rel="noopener noreferrer"
    className="underline"
  >
    Grand Bargain Project Terms of Service and Privacy Policy
  </a>{' '}
  and agree to receive occasional emails from us about our work.
  <br />
  You can unsubscribe at any time.
</p>
<div className="mt-6"><br></br>
  <p className="text-sm text-center font-semibold text-gray-800 mb-2">Share with your family, friends, and communities</p>
  <div className="flex justify-center gap-4">
    <WhatsappShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 36 policy proposals. 
One simple question. To get the policy reforms that you see as critical to you, your family and your community - could you accept the reforms you would otherwise oppose?">
      <WhatsappIcon size={32} round />
    </WhatsappShareButton>
    <TwitterShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 36 policy proposals. 
One simple question. To get the policy reforms that you see as critical to you, your family and your community - could you accept the reforms you would otherwise oppose?">
      <TwitterIcon size={32} round />
    </TwitterShareButton>
    <FacebookShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 36 policy proposals. 
One simple question. To get the policy reforms that you see as critical to you, your family and your community - could you accept the reforms you would otherwise oppose?">
      <FacebookIcon size={32} round />
    </FacebookShareButton>
    <LinkedinShareButton url="https://grand-bargain-app.netlify.app" title="Grand Bargain Project WebApp" summary="A practical way to move the country forward.">
      <LinkedinIcon size={32} round />
    </LinkedinShareButton>
  </div>
</div>

        </form>

        
      )}
      {submitted && (
  <div className="text-center mt-6 space-y-4">
    <img src={logo} alt="Grand Bargain Project" className="h-12 mx-auto" />
    <h2 className="text-lg sm:text-xl font-bold text-gray-800">
      Thank you for your time and details
    </h2>
    <p className="text-sm text-gray-700">
      Learn more about our work and how you can get involved
    </p>
    <a
      href="https://www.grandbargainproject.org"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block mt-2 bg-[#142d95] text-white px-6 py-2 rounded text-sm font-semibold"
    >
      Grand Bargain Project Home
    </a>
    <div className="mt-6"><br></br>
  <p className="text-sm text-center font-semibold text-gray-800 mb-2">Share with your family, friends, and communities</p>
  <div className="flex justify-center gap-4">
    <WhatsappShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 36 policy proposals. 
One simple question. To get the policy reforms that you see as critical to you, your family and your community - could you accept the reforms you would otherwise oppose?">
      <WhatsappIcon size={32} round />
    </WhatsappShareButton>
    <TwitterShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 36 policy proposals. 
One simple question. To get the policy reforms that you see as critical to you, your family and your community - could you accept the reforms you would otherwise oppose?">
      <TwitterIcon size={32} round />
    </TwitterShareButton>
    <FacebookShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 36 policy proposals. 
One simple question. To get the policy reforms that you see as critical to you, your family and your community - could you accept the reforms you would otherwise oppose?">
      <FacebookIcon size={32} round />
    </FacebookShareButton>
    <LinkedinShareButton url="https://grand-bargain-app.netlify.app" title="Grand Bargain Project WebApp" summary="A practical way to move the country forward.">
      <LinkedinIcon size={32} round />
    </LinkedinShareButton>
  </div>
</div>
  </div>
  
)}

    </div>
  </div>
  </div>
)}
{showDirectionPopup && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-start justify-center overflow-y-auto min-h-screen pt-40">
    <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-2xl p-4 sm:p-6 text-xl text-gray-800 space-y-4">
    <div className="bg-white p-4 rounded shadow-sm">
      {/* Display the message at the top */}
      {!submitted && (
  <>
    <p className="text-lg font-bold text-gray-800 mb-6">
    Thank you for submitting your answers!
</p>

<p className="text-lg italic text-gray-700">
We will continue to refine the Grand Bargain to see if we can craft a package that works for you and others. Would you be interested in attending a workshop to hash out an even better set of reforms?
</p>

    <div className="h-4" /> {/* Spacer */}
  </>
)}

      {/* Email Submission Form */}
      {!submitted && (
        <form onSubmit={handleFinalSubmit} className="space-y-4">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label htmlFor="fname" className="text-sm font-medium text-gray-800">First Name*</label>
              <input
                id="fname"
                name="fname"
                type="text"
                value={formData.fname}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                required
              />
            </div>

            <div className="flex-1">
              <label htmlFor="lname" className="text-sm font-medium text-gray-800">Last Name*</label>
              <input
                id="lname"
                name="lname"
                type="text"
                value={formData.lname}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                required
              />
            </div>
            <div className="flex-1">
              <label htmlFor="Zip" className="text-sm font-medium text-gray-800">Zip</label>
              <input
                id="zip"
                name="zip"
                type="text"
                value={formData.zip}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              />
            </div>
            </div>

            <div className="flex-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-800">Emai*</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
                required
              />
            </div>  

          <button
            type="submit"
            className="w-full bg-[#142d95] text-white p-2 rounded mt-4"
          >
            Submit
          </button>
          <p className="text-[10px] text-gray-500 mt-3 leading-snug">
  By submitting your details, you accept the{' '}
  <a
    href="https://www.grandbargainproject.org/copy-of-data-privacy"
    target="_blank"
    rel="noopener noreferrer"
    className="underline"
  >
    Grand Bargain Project Terms of Service and Privacy Policy
  </a>{' '}
  and agree to receive occasional emails from us about our work.
  <br />
  You can unsubscribe at any time.
</p>
<div className="mt-6"><br></br>
  <p className="text-sm text-center font-semibold text-gray-800 mb-2">Share with your family, friends, and communities</p>
  <div className="flex justify-center gap-4">
    <WhatsappShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 36 policy proposals. 
One simple question. To get the policy reforms that you see as critical to you, your family and your community - could you accept the reforms you would otherwise oppose?">
      <WhatsappIcon size={32} round />
    </WhatsappShareButton>
    <TwitterShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 36 policy proposals. 
One simple question. To get the policy reforms that you see as critical to you, your family and your community - could you accept the reforms you would otherwise oppose?">
      <TwitterIcon size={32} round />
    </TwitterShareButton>
    <FacebookShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 36 policy proposals. 
One simple question. To get the policy reforms that you see as critical to you, your family and your community - could you accept the reforms you would otherwise oppose?">
      <FacebookIcon size={32} round />
    </FacebookShareButton>
    <LinkedinShareButton url="https://grand-bargain-app.netlify.app" title="Grand Bargain Project WebApp" summary="A practical way to move the country forward.">
      <LinkedinIcon size={32} round />
    </LinkedinShareButton>
  </div>
</div>

    <div className="h-4" /> {/* Spacer */}
        </form>
      )}
      {submitted && (
  <div className="text-center mt-6 space-y-4">
    <img src={logo} alt="Grand Bargain Project" className="h-12 mx-auto" />
    <h2 className="text-lg sm:text-xl font-bold text-gray-800">
      Thank you for your time and details
    </h2>
    <p className="text-sm text-gray-700">
      Learn more about our work and how you can get involved
    </p>
    <a
      href="https://www.grandbargainproject.org"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block mt-2 bg-[#142d95] text-white px-6 py-2 rounded text-sm font-semibold"
    >
      Grand Bargain Project Home
    </a>

    <div className="mt-6"><br></br>
  <p className="text-sm text-center font-semibold text-gray-800 mb-2">Share with your family, friends, and communities</p>
  <div className="flex justify-center gap-4">
    <WhatsappShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 36 policy proposals. 
One simple question. To get the policy reforms that you see as critical to you, your family and your community - could you accept the reforms you would otherwise oppose?">
      <WhatsappIcon size={32} round />
    </WhatsappShareButton>
    <TwitterShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 36 policy proposals. 
One simple question. To get the policy reforms that you see as critical to you, your family and your community - could you accept the reforms you would otherwise oppose?">
      <TwitterIcon size={32} round />
    </TwitterShareButton>
    <FacebookShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 36 policy proposals. 
One simple question. To get the policy reforms that you see as critical to you, your family and your community - could you accept the reforms you would otherwise oppose?">
      <FacebookIcon size={32} round />
    </FacebookShareButton>
    <LinkedinShareButton url="https://grand-bargain-app.netlify.app" title="Grand Bargain Project WebApp" summary="A practical way to move the country forward.">
      <LinkedinIcon size={32} round />
    </LinkedinShareButton>
  </div>
</div>

    <div className="h-4" /> {/* Spacer */}
  </div>
)}
</div>
    </div>
  </div>
)}


{!submitted && totalAssigned < totalProposals && categoryOrder.map(category => {
  const proposals = proposalsData[category] || [];
  const bgColor = categoryColors[category] || '#142d95';
  const remainingProposals = proposals.filter(p => !isAssigned(p.id));
  const isEmpty = remainingProposals.length === 0;

  return (
    <div key={category} className="mb-6">
      <button
        onClick={() => toggleCategory(category)}
        className="w-full text-left px-4 py-3 rounded flex items-center justify-between"
        style={{ backgroundColor: bgColor, color: 'white', height: isEmpty ? '12px' : 'auto', opacity: isEmpty ? 0.5 : 1 }}
      >
        {!isEmpty && <span className="font-semibold">{category}</span>}
        <ChevronDown size={20} className={`transition-transform ${expandedCategories[category] ? 'rotate-180' : ''}`} />
      </button>
      {expandedCategories[category] && (
        <>
          {categoryDescriptions[category] && (
            <div className="text-lg text-gray-700 whitespace-pre-line mt-4 mb-2 pl-3 italic bg-yellow-100">
              {categoryDescriptions[category]}
            </div>
          )}
          
          <div className="text-lg text-gray-800 whitespace-pre-line mt-4 mb-6 pl-3 pr-3 pt-4 pb-6 italic bg-blue-100 rounded">
            <strong>THE OVERALL PROPOSAL:</strong>{' '}
            {category === 'Economic Mobility and Growth' && (
              <>Incentivize underemployed Americans to more fully participate in the workforce. Upgrade the skills of workers who are not reaching their potential. Promote basic research and entrepreneurship. Eliminate obstacles to building new affordable housing.</>
            )}
            {category === 'K-12 Education' && (<>Provide teachers with the training and resources to significantly boost their students’ learning. Hold teachers and schools to account for producing results. Incentivize parents to support their children’s education.</>)}
            {category === 'Healthcare' && (<>Stop paying doctors and other providers for the volume of tests and procedures they perform and, instead, pay for improving health outcomes at lower cost. Incentivize Americans to eat healthy foods.</>)}
            {category === 'Energy Policy' && (<>Incentivize Americans, businesses, state governments and other countries to use energy efficiently by: 1) Replacing wasteful subsidies, mandates and regulations and instead taxing carbon emissions. 2) Transmitting energy in ways that minimize the costs to consumers.</>)}
            {category === 'Taxes' && (<>Raise taxes on those who can most afford it. This will generate enough revenue to pay for the benefits in health, education and economic opportunity described in previous sections. This will in turn yield the political stability that we all want.<br /><br /> Eliminate complexity that invites tax evasion. Make entitlement spending more efficient. Incentivize businesses to invest in assets that will increase productivity, future income – and future tax revenue.</>)}
            {category === 'Federal Spending & Debt' && (<>The sections on Energy and Taxes would raise revenue. The section on Healthcare would reduce costs. The sections on Mobility, Healthcare, Education and Energy would increase productivity, boosting GDP. The debt-to-GDP ratio would therefore start declining.<br /><br /> Additional proposals to curb the debt might not be necessary. </>)}
            <div className="flex flex-wrap gap-2 mt-4">
              {buckets.map(bucket => (
                <button
                  key={bucket}
                  onClick={() => {
                    const remaining = proposalsData[category].filter(p => !isAssigned(p.id));
                    const newAssignments = {};
                    remaining.forEach(p => {
                      newAssignments[p.id] = bucket;
                    });
                    setAssignments(prev => ({ ...prev, ...newAssignments }));
                  }}
                  className="bg-white border border-[#dbabbf] text-[#101761] hover:bg-pink-100 px-3 py-1 rounded text-xs font-semibold transition"
                >
                  {bucket}
                </button>
              ))}
            </div>
          </div>

          {category !== 'Federal Spending & Debt' && (
  <div className="text-lg text-gray-700 whitespace-pre-line mt-4 mb-2 pl-3 italic">
    The initial proposals:
  </div>
)}

{remainingProposals.length > 0 && (
  <div className="grid grid-cols-1 gap-4 mt-2">
    {remainingProposals.map(({ id, title }) => (
      <div
        key={id}
        className="bg-white border border-gray-200 p-4 rounded shadow hover:shadow-md text-sm"
      >
        <p className="font-bold text-base mb-2">{title}</p>
        {title !== 'Federal Spending & Debt Overall Proposal' && (
          <div className="flex flex-wrap gap-2">
            {buckets.map(bucket => (
              <button
                key={bucket}
                onClick={() => handleAssign(id, bucket)}
                className="bg-white border border-[#dbabbf] text-[#101761] hover:bg-pink-100 px-3 py-1 rounded text-xs font-semibold transition"
              >
                {bucket}
              </button>
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
)}
        </>
      )}
    </div>
  );
})}
<footer className="mt-10 text-center text-lg text-gray-500 border-t pt-4">
  Copyright &copy; 2025 by Center for Collaborative Democracy
</footer>
    </div>
  </>
)};

export default App;