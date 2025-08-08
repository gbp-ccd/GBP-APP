import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';
import proposalsData from './proposals_by_category.json';
import { v4 as uuidv4 } from 'uuid';
import logo from './assets/logo.png';
import Airtable from 'airtable';
import { AnimatePresence, motion } from 'framer-motion';
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

const airtableBase = new Airtable({ apiKey: 'path3Ukx1qRJ8Dnyr.39728a9c6a0de42cea4a032af4293972588a86e08f9d45728a220821a4b8494c' }).base('appBtoRXEUDlndqrJ');

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
  'Economic Mobility and Growth': '#566bcb',
  'K-12 Education': '#21c0c2',
  'Healthcare': '#35c484',
  'Energy Policy': '#fdc000',
  'Taxes': '#af3e3e',
  'Federal Spending & Debt': '#1e146f',
  
};

const categoryDescriptions = {
  'Economic Mobility and Growth': `THE PROBLEM: 77% of Americans believe the economy benefits powerful interests at their expense. People on the bottom half of the ladder have indeed been losing relative ground for decades. `,

  'K-12 Education': `THE PROBLEM: Our educational attainment has long been among the worst in the developed world. Since Covid, academic achievement has fallen further.`,

  'Healthcare': `THE PROBLEM: The US spends 18% of GDP on healthcare. Other developed countries spend 10%. Yet our health is the worst in the developed world. 

We thereby squander at least $2.3 trillion each year - which boosts the national debt; and shortchanges long-term investments in education, skills training and economic opportunity.`,

  'Energy Policy': `THE PROBLEM: The federal government subsidizes both fossil fuels and renewables, which wastes hundreds of billions of dollars annually. America thereby fritters away valuable resources, while allowing extreme weather to injure millions of Americans, harm our environment and weaken the economy. `,

'Taxes': `THE PROBLEM: Politicians from both parties routinely provide their strongest supporters with tax breaks, which boost the national debt and reward wasteful investments.`,

   'Federal Spending & Debt': `THE PROBLEM: The federal debt, which now equals 100% of GDP, will reach 120% by 2036. Yet both political parties keep offering solutions they know most voters will reject.`

};

function App() {
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [introStep, setIntroStep] = useState(1);
  const [assignments, setAssignments] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [formData, setFormData] = useState({ fname: '', lname: '', email: '', zip: ''});
  const [submitted, setSubmitted] = useState(false);
  const [reflectionStep, setReflectionStep] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [showPackagePopup, setShowPackagePopup] = useState(false);
  const [showDirectionPopup, setShowDirectionPopup] = useState(false);
  const APP_VERSION = 'General V2'; // or 'v1-students', 'v1-donors', etc.
  const packageRef = React.useRef(null);
const directionRef = React.useRef(null);
const [isSubmittingQ2, setIsSubmittingQ2] = useState(false);
const [isSubmittingFinalForm, setIsSubmittingFinalForm] = useState(false);
const [isSubmittingQ3, setIsSubmittingQ3] = useState(false);
const categoryRefs = useRef({});
const reflectionStep2Ref = useRef(null);
const totalAssigned = Object.keys(assignments).length;
const totalProposals = Object.values(proposalsData).flat().length;
const firstCategoryRef = useRef(null);
const [readyToSubmit, setReadyToSubmit] = useState(false);
const [ratingsSubmitted, setRatingsSubmitted] = useState(false);
const [submitPromptShown, setSubmitPromptShown] = useState(false);
const showForm = totalAssigned === totalProposals && !submitted && reflectionStep !== 0;

const scrollToFirstCategory = () => {
  setExpandedCategories(prev => ({ ...prev, 'Economic Mobility and Growth': true }));

  setTimeout(() => {
    if (firstCategoryRef.current) {
      firstCategoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100); // Delay gives React time to render the expanded section
};


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
  q3: '',
  q4: ''
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


useEffect(() => {
  if ((reflectionStep === 2 || reflectionStep === 3) && reflectionStep2Ref.current) {
    setTimeout(() => {
      reflectionStep2Ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}, [reflectionStep]);
  const handleAssign = (proposalId, bucket) => {
  setAssignments(prev => {
    const newAssignments = { ...prev, [proposalId]: bucket };
    return newAssignments;
  });
};

  const handleUnassign = (proposalId) => {
  if (submitted) return;

  setAssignments(prev => {
    const newAssignments = { ...prev };
    delete newAssignments[proposalId];
    return newAssignments;
  });

  setReadyToSubmit(false); // hide "Submit Ratings" button

  // Auto-expand the category this proposal belongs to
  const foundCategory = Object.entries(proposalsData).find(([cat, proposals]) =>
    proposals.some(p => p.id.toString() === proposalId)
  )?.[0];

  if (foundCategory) {
    toggleCategory(foundCategory);
  }
};

  const toggleCategory = (category) => {
  setExpandedCategories(prev => {
    const isExpanding = !prev[category];
    const newState = { ...prev, [category]: !prev[category] };

    if (isExpanding && !readyToSubmit && reflectionStep === 0) {
      setTimeout(() => {
        const el = categoryRefs.current[category];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }

    return newState;
  });
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
    reflection_q4: reflectionAnswers.q4.toString(),
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
            reflection_q4: reflectionAnswers.q4.toString(),
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
  const progressPercent = (totalAssigned / totalProposals) * 100;


  

  return (
    <>
      {showIntroModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-start justify-center overflow-y-auto min-h-screen pt-10">
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-2xl p-4 sm:p-6 text-lg text-gray-800 space-y-4">

          <AnimatePresence mode="wait">
  <motion.div
    key={introStep}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
 >
        {introStep === 1 && (
  <div
    className="p-[3px] rounded-xl"
    style={{
      background: 'linear-gradient(135deg, #f4b7b7 0%, #ffffff 50%, #8993d6 100%)',
    }}
  >
    <div className="bg-white rounded-lg p-4 space-y-4">
      <p className="!text-2xl font-bold text-center">
        <strong>Grand Bargain WebApp</strong>
      </p>
      <p className="text-center mb-2">
        <strong>Let's Create an America That Meets Your Aspirations</strong>
      </p>
      <p>
        We the American people seem to grow more divided each year, yet we nearly all aspire for:
      </p>
      <p>
        <strong>Greater economic opportunity & growth</strong><br />
        <strong>Schools that enable our kids to reach their potential</strong><br />
        <strong>More effective & affordable healthcare</strong><br />
        <strong>Efficient spending to lower the national debt</strong><br />
        <strong>Dependable, clean & affordable energy</strong><br />
        <strong>A fairer, simpler tax code</strong>
      </p>
      <div className="text-left mt-4">
        <button
          className="bg-[#142d95] text-white px-6 py-2 rounded text-sm mt-4"
          onClick={() => setIntroStep(2)}
        >
          Next
        </button>
      </div>
    </div>
  </div>
)}

        {introStep === 2 && (
          <div className="animate-fade-in duration-300">
  <div
    className="p-[3px] rounded-xl"
    style={{
      background: 'linear-gradient(135deg, #f4b7b7 0%, #ffffff 50%, #8993d6 100%)',
    }}
  >
    <div className="bg-white rounded-lg p-4 space-y-4">
      <p><strong>We nearly all share these aspirations,</strong> yet our political system puts them out of reach.</p> 
      <p>Whichever party is in power enacts each law to satisfy its supporters on their favorite causes, while letting our overall problems grow worse.</p>
      <p><strong>Our political system has in effect ceased to function.</strong></p>
      <div className="text-left mt-4">
        <button className="bg-[#142d95] text-white px-6 py-2 rounded text-sm mt-4" onClick={() => setIntroStep(3)}>
          Next
        </button>
      </div>
    </div>
  </div>
  </div>
)}

        {introStep === 3 && (
  <div
    className="p-[3px] rounded-xl"
    style={{
      background: 'linear-gradient(135deg, #f4b7b7 0%, #ffffff 50%, #8993d6 100%)',
    }}
  >
    <div className="bg-white rounded-lg p-4 space-y-4">
      <p><strong>So that each American will have maximum opportunities to thrive, the Grand Bargain Project team</strong> gathered ideas from various groups trying to advance the six goals that Americans share.</p>
      <p>We then distilled those ideas into 35 practical reforms that will:</p>
      <div className="leading-snug mt-[-0.5rem] font-bold">
        <p className="m-0">Yield major progress in these six areas</p>
        <p className="m-0">Work well together</p>
        <p className="m-0">Boost efficiency and lower costs</p>
        <p className="m-0">Significantly advance each American’s aspirations</p>
      </div>
      <div className="text-left mt-4">
        <button className="bg-[#142d95] text-white px-6 py-2 rounded text-sm mt-4" onClick={() => setIntroStep(4)}>
          Next
        </button>
      </div>
    </div>
  </div>
)}

        {introStep === 4 && (
  <div
    className="p-[3px] rounded-xl"
    style={{
      background: 'linear-gradient(135deg, #f4b7b7 0%, #ffffff 50%, #8993d6 100%)',
    }}
  >
    <div className="bg-white rounded-lg p-4 space-y-4">
      <p><strong>In a recent recent YouGov poll, 77% of Americans using this WebApp preferred this package of reforms over the country’s current direction.</strong></p>
      <p>That 77% far exceeds approval ratings for both political parties combined.</p>
      <p>To see for yourself how this Grand Bargain would be better for you than the country’s current direction, the next screens will ask you to:</p>
      <div className="leading-snug mt-[-0.5rem] ">
        <p className="m-0">1. Rate each reform</p>
        <p className="m-0">2. Evaluate the total package</p>
        <p className="m-0">3. If you have doubts, tell us why</p>
        <p className="m-0">4. If you approve, join our movement</p>
      </div>
      <div className="text-left">
        <button className="bg-[#142d95] text-white px-6 py-2 rounded text-sm mt-4" onClick={() => setShowIntroModal(false)}>
          Please Begin
        </button>
      </div>
    </div>
  </div>
)}
  </motion.div>
</AnimatePresence>
      </div>
    </div>
)}


<div className="p-6 font-sans bg-white text-gray-800 min-h-screen">
  <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
    <img src={logo} alt="Grand Bargain Project" className="h-12 sm:h-14" />
    <h1 className="text-2xl sm:text-3xl font-bold text-[#142d95]">
      Grand Bargain WebApp
    </h1>
  </div>

 

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
<div className="text-base sm:text-lg text-gray-800 mb-6 text-left border border-gray-300 rounded-xl p-5 sm:p-6 bg-white shadow-sm w-full space-y-2">
  <p>At the bottom of the the page, you will see <strong>the 6 policy areas</strong>. Each is in a different color.</p>

  <div className="space-y-2">
    <p className="font-semibold">By clicking on each bar, you will see:</p>
    <ul className="list-disc pl-5 list-inside space-y-1 text-gray-700">
      <li>Description of the basic problem</li>
      <li><strong>Overall</strong> description of our proposals</li>
      <li><em>Description of each proposal</em></li>
      <div style={{ height: '0.5rem' }} />
      </ul>
      <strong>You can rate either: The overall proposal OR each <em>individual proposal</em></strong>
      <ul className="list-disc pl-5 list-inside space-y-1 text-gray-700">
      <li>There are 5 ratings: From <strong>Critical To Me & Others</strong> to <strong>Hate It</strong></li>
    </ul>
  </div>

  <p className="font-semibold text-[#142d95]">Please focus on proposals that really matter to you.</p>
  <ul className="list-disc pl-5 list-inside space-y-1 text-gray-700">
  <li className="italic">Any that seem unclear or vague, just rate <strong>Not Sure</strong></li>
  </ul>
  <div style={{ height: '0.5rem' }} />
  <p className="font-semibold">If you change your mind about any rating, go to the top of the page to 'x' that proposal. Then, in that original policy area, you can re-rate that item.</p>

    <div className="flex justify-left mt-4">
      <button
  onClick={scrollToFirstCategory}
  className="bg-[#142d95] text-white px-6 py-2 rounded-lg text-base sm:text-lg shadow hover:bg-[#0f2275] transition mt-4"
>
  Start Rating
</button>
    </div>
  </div>
)}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
  {buckets.map(bucket => (
    <div
  key={bucket}
      className="relative bg-white border border-gray-200 rounded-md p-3 flex-1 min-w-[180px] text-left shadow-sm"
    >
      <div
  className="absolute top-0 left-0 h-1 w-full rounded-t-md bg-gray-400"
/>
      <h2 className="text-sm font-semibold text-gray-800 tracking-wide pt-2">
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

            // 🛑 Skip rendering individual assignments for 'Federal Spending & Debt'
            if (category === 'Federal Spending & Debt' && proposal.title === '') return null;

            const bg = categoryColors[category] || '#eee';
            return (
              <div
  key={id}
  className="p-2 rounded text-xs shadow-sm border border-gray-300 flex justify-between items-start gap-2"
  style={{ backgroundColor: `${bg}1A` }} // 10% tint of the category color
>
  <div className="flex justify-between items-center gap-2">
    <span className="whitespace-pre-line">{proposal.title}</span>
    {!(ratingsSubmitted && totalAssigned === totalProposals) && (
  <button
    onClick={() => handleUnassign(id)}
    className="text-gray-500 hover:text-red-500"
    title="Remove from bucket"
  >
    <X size={20} />
  </button>
)}
  </div>
</div>
            );
          })}
      </div>
    </div>
  ))}
</div>
{(() => {
  if (totalAssigned === totalProposals && !readyToSubmit && !submitted) {
    if (!submitPromptShown) setSubmitPromptShown(true);
    return true;
  }
  return false;
})() && (
  <div className="bg-green-50 border border-green-200 p-4 rounded mb-6">
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md space-y-5">
      <div className="text-center mt-6 mb-8">
        <p className="mb-4 text-lg text-gray-700">
          All the proposals have been sorted. Please review your choices, make any changes you see fit, and when ready, click <strong>Submit Ratings</strong> to continue.
        </p>
        <button
          onClick={() => {
            setRatingsSubmitted(true);
            setReadyToSubmit(true);
            setReflectionStep(2);
          }}
          className="bg-[#142d95] text-white px-6 py-3 rounded text-base font-semibold hover:bg-[#101761] transition"
        >
          Submit My Ratings
        </button>
      </div>
    </div>
  </div>
)}

{(reflectionStep === 2 || reflectionStep === 3) && (
  <div
    ref={reflectionStep2Ref}
    className="rounded-lg shadow-lg p-1 mb-6"
    style={{
      background: 'linear-gradient(135deg, #e0f2f1, #e8f5e9, #ffffff)',
    }}
  >
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md space-y-5">
      {reflectionStep === 2 && (
        <div className="space-y-5 text-base sm:text-lg text-gray-800">
          <p className="text-lg sm:text-xl font-semibold text-gray-900">
            The reforms that you rated positively have been around for years. Congress has enacted none of them.
          </p>

          <div className="space-y-3 leading-relaxed">
            <p>The reason: Most Congresspeople blame the other party for the country’s ills and offer sound bites as remedies, instead of working together on genuine solutions.</p>
            <p>To change this situation, we the American people need to find a total package that 75% or more of us support.</p>
          </div>

          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded text-base sm:text-lg text-gray-800">
            <strong>We would then be the largest bloc of voters in US history. Elected officials would move in the direction we ask — or lose their seats.</strong>
          </div>

          <p className="text-base sm:text-lg">
            <strong>77%</strong> of voters using this WebApp have preferred this package over the country’s current direction.
          </p>

          <p className="text-base sm:text-lg">Do you expect this Congress to offer a better deal?</p>
          <p className="text-base sm:text-lg">So, which would you prefer: Telling members of Congress to enact this Grand Bargain or letting them decide your future?</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-left">
            <button
              className={`px-5 py-2 rounded text-sm shadow ${
                reflectionAnswers.q2 === true
                  ? 'bg-[#142d95] text-white'
                  : 'bg-gray-300 hover:bg-[#142d95] hover:text-white'
              } transition`}
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
              className={`px-5 py-2 rounded text-sm shadow ${
                reflectionAnswers.q2 === false
                  ? 'bg-[#142d95] text-white'
                  : 'bg-gray-300 hover:bg-[#142d95] hover:text-white'
              } transition`}
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
                        reflection_q2: "false",
                        reflection_q3: '',
                        submitted_at: new Date().toISOString(),
                        version: APP_VERSION,
                      },
                    },
                  ]);
                  setReflectionAnswers(prev => ({ ...prev, q2: false }));
                  setReflectionStep(3);
                } catch (err) {
                  console.error('Error submitting reflection_q2: false to Airtable:', err);
                } finally {
                  setIsSubmittingQ2(false);
                }
              }}
            >
              {isSubmittingQ2 ? 'Submitting...' : 'Congress Decides'}
            </button>
          </div>
        </div>
      )}

      {reflectionStep === 3 && (
        <div>
          <p className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
  If you want Congress to decide our future
</p>
<p className="mb-4 text-base sm:text-lg text-gray-800">
  What changes would get you to support the total package – that you think more than 77% of the country would accept?
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
              if (isSubmittingQ3) return;
              setIsSubmittingQ3(true);
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
                const findResult = await airtableBase('submissions').select({
                  filterByFormula: `{session_id} = "${sessionId}"`,
                  maxRecords: 1
                }).firstPage();

                if (findResult.length > 0) {
                  const recordId = findResult[0].id;
                  await airtableBase('submissions').update(recordId, {
                    reflection_q3: reflectionAnswers.q3.toString(),
                    assignment: JSON.stringify(assignmentArray),
                    submitted_at: new Date().toISOString(),
                  });
                } else {
                  console.error('No existing submission found to update for session_id:', sessionId);
                }

                setReflectionStep(0);
                setShowDirectionPopup(true);
              } catch (err) {
                console.error('Error submitting Q3 reflection to Airtable:', err);
              } finally {
                setIsSubmittingQ3(false);
              }
            }}
          >
            {isSubmittingQ3 ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      )}
    </div>
  </div>
)}

{showPackagePopup && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-start justify-center overflow-y-auto min-h-screen pt-10">
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
    <WhatsappShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 35 policy proposals. 
One simple question. To get the policy reforms that you see as critical to you, your family and your community - could you accept the reforms you would otherwise oppose?">
      <WhatsappIcon size={32} round />
    </WhatsappShareButton>
    <TwitterShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 35 policy proposals. 
One simple question. To get the policy reforms that you see as critical to you, your family and your community - could you accept the reforms you would otherwise oppose?">
      <TwitterIcon size={32} round />
    </TwitterShareButton>
    <FacebookShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 35 policy proposals. 
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
    <WhatsappShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 35 policy proposals. 
One simple question. To get the policy reforms that you see as critical to you, your family and your community - could you accept the reforms you would otherwise oppose?">
      <WhatsappIcon size={32} round />
    </WhatsappShareButton>
    <TwitterShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 35 policy proposals. 
One simple question. To get the policy reforms that you see as critical to you, your family and your community - could you accept the reforms you would otherwise oppose?">
      <TwitterIcon size={32} round />
    </TwitterShareButton>
    <FacebookShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 35 policy proposals. 
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
  <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-start justify-center overflow-y-auto min-h-screen pt-10">
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
    <WhatsappShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 35 policy proposals. 
One simple question. To get the policy reforms that you see as critical to you, your family and your community - could you accept the reforms you would otherwise oppose?">
      <WhatsappIcon size={32} round />
    </WhatsappShareButton>
    <TwitterShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 35 policy proposals. 
One simple question. To get the policy reforms that you see as critical to you, your family and your community - could you accept the reforms you would otherwise oppose?">
      <TwitterIcon size={32} round />
    </TwitterShareButton>
    <FacebookShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 35 policy proposals. 
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
    <WhatsappShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 35 policy proposals. 
One simple question. To get the policy reforms that you see as critical to you, your family and your community - could you accept the reforms you would otherwise oppose?">
      <WhatsappIcon size={32} round />
    </WhatsappShareButton>
    <TwitterShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 35 policy proposals. 
One simple question. To get the policy reforms that you see as critical to you, your family and your community - could you accept the reforms you would otherwise oppose?">
      <TwitterIcon size={32} round />
    </TwitterShareButton>
    <FacebookShareButton url="https://grand-bargain-app.netlify.app" title="Check out the Grand Bargain Project WebApp! 6 key issues, 35 policy proposals. 
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


{!submitted && totalAssigned < totalProposals && categoryOrder.map((category, index) => {
  const proposals = proposalsData[category] || [];
  const bgColor = categoryColors[category] || '#142d95';
  const remainingProposals = proposals.filter(p => !isAssigned(p.id));
  const isEmpty = remainingProposals.length === 0;

  return (
    <div
      key={category}
      ref={el => {
  categoryRefs.current[category] = el;
  if (index === 0 && !firstCategoryRef.current) {
    firstCategoryRef.current = el;
  }
}}
      className="mb-6"
    >
      <button
        onClick={() => toggleCategory(category)}
        className="w-full text-left px-4 py-3 rounded flex items-center justify-between text-shadow"
        style={{
          backgroundColor: bgColor,
          color: 'white',
          height: isEmpty ? '12px' : 'auto',
          opacity: isEmpty ? 0.5 : 1,
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
        }}
      >
        {!isEmpty && <span className="font-semibold">{category}</span>}
        <ChevronDown size={20} className={`transition-transform ${expandedCategories[category] ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence mode="wait">
        {expandedCategories[category] && (
  <motion.div
  initial={{ opacity: 0, scaleY: 0 }}
  animate={{ opacity: 1, scaleY: 1 }}
  transition={{ duration: 0.3 }}
  style={{ transformOrigin: 'top' }}
>
    <div className="space-y-4">
            {categoryDescriptions[category] && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 italic text-base sm:text-lg text-gray-700">
                {categoryDescriptions[category]}
              </div>
            )}
            {(!submitPromptShown || category === 'Federal Spending & Debt') && (
            <div className="text-base sm:text-lg text-gray-800 whitespace-pre-line mt-4 mb-6 pl-3 pr-3 pt-4 pb-6 italic bg-blue-100 border-l-4 border-blue-400 rounded">
              <strong>THE OVERALL PROPOSAL:</strong>{' '}
              {category === 'Economic Mobility and Growth' && (
                <>Provide low-paid workers with the skills to move up the economic ladder. Incentivize underemployed Americans to more fully participate in the workforce. Promote basic research and entrepreneurship. End obstacles to building new affordable housing.</>
              )}
              {category === 'K-12 Education' && (<>Provide teachers with the training and resources to significantly boost their students’ learning. Hold teachers and schools to account for producing results. Incentivize parents to support their children’s education.</>)}
              {category === 'Healthcare' && (<>Stop paying doctors and other providers for the volume of tests and procedures they perform and, instead, pay for improving health outcomes at lower cost. Incentivize Americans to eat healthy foods.</>)}
              {category === 'Energy Policy' && (<>Provide Americans, businesses, state governments and other countries with incentives to use energy efficiently by: 1) Eliminating wasteful subsidies, mandates and regulations. 2) Reducing extreme droughts, floods, hurricanes, blizzards and wildfires by taxing carbon emissions. 3) Transmitting energy in ways that minimize the costs to consumers.</>)}
              {category === 'Taxes' && (<>To pay for the benefits in health, education and economic opportunity described in earlier sections, raise taxes on those who can most afford it. <br /><br />Eliminate complexity that invites tax evasion. Reward businesses for investing in assets that will increase productivity and future income. Make entitlement spending more efficient.</>)}
              {category === 'Federal Spending & Debt' && (<>To curb the debt in ways that will improve each American's future, in this Grand Bargain: <br /><br />1) The Economic Mobility, Education, Healthcare and Energy proposals would boost productivity and growth.<br /> 2) The Healthcare proposals would reduce costs and increase productivity.<br /> 3) The Tax and Energy proposals would raise revenue and increase efficiency.<br /><br /> <strong>The result: The debt - as a percentage of the overall economy - would steadily decline.</strong> </>)}
              <div className="flex flex-wrap gap-2 mt-4">
                {buckets.map(bucket => (
                  <button
                    key={bucket}
                    onClick={() => {
                      if (category === 'Federal Spending & Debt') {
                        const overallProposal = proposalsData[category].find(p => p.title === 'Federal Spending & Debt Overall Proposal');
                        if (overallProposal) {
                          setAssignments(prev => ({
                            ...prev,
                            [overallProposal.id]: bucket,
                          }));
                        }
                      } else {
                        const remaining = proposalsData[category].filter(p => !isAssigned(p.id));
                        const newAssignments = {};
                        remaining.forEach(p => {
                          newAssignments[p.id] = bucket;
                        });
                        setAssignments(prev => ({ ...prev, ...newAssignments }));
                      }
                    }}
                    className="bg-white border border-[#dbabbf] text-[#101761] hover:bg-pink-100 px-3 py-1 rounded text-xs font-semibold transition"
                  >
                    {bucket}
                  </button>
                ))}
              </div>
            </div>
            )}
            {category !== 'Federal Spending & Debt' && (
              <div className="text-lg text-gray-700 whitespace-pre-line mt-4 mb-2 pl-3 italic">
                The individual proposals:
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {remainingProposals
                .filter(p => p.title && p.title.trim() !== '' && !(category === 'Federal Spending & Debt' && p.title === 'Federal Spending & Debt Overall Proposal'))
                .map(({ id, title }) => (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 6 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white border border-gray-200 p-4 rounded-md shadow-md mb-4"
                  >
                    {title && (
                      <p className="font-bold text-base mb-4">{title}</p>
                    )}
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
                    
                  </motion.div>
                ))}
            </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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