import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';
import proposalsData from './proposals_by_category.json';
import { v4 as uuidv4 } from 'uuid';
import logo from './assets/logo.png';
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


async function callAirtableAPI(payload) {
  const res = await fetch('/.netlify/functions/airtable-update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Airtable API error');
  return json.records;
}

async function createRecord(table, fields) {
  return await callAirtableAPI({ action: 'create', table, fields });
}

async function updateRecord(table, recordId, fields) {
  return await callAirtableAPI({ action: 'update', table, recordId, fields });
}

async function selectRecords(table, filterByFormula = '', maxRecords = 1) {
  return await callAirtableAPI({ action: 'select', table, filterByFormula, maxRecords });
}

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

  'Energy Policy': `THE PROBLEM: The federal government subsidizes both fossil fuels and renewables, which wastes hundreds of billions of dollars annually. America thereby fritters away valuable resources, while allowing extreme weather to injure millions of families by harming their environment and weakening the economy. `,

'Taxes': `THE PROBLEM: Politicians from both parties routinely provide their strongest supporters with tax breaks, which boost the national debt and reward wasteful investments.`,

   'Federal Spending & Debt': `THE PROBLEM: The US government spends $6 per senior for every $1 on a child under 18; favors consumption over investing in the future; and gives tax breaks to favored interests. This puts the federal debt on track to reach 130% of GDP by 2036, which would send interest rates soaring, hobbling our economy. Yet both political parties have let the problem grow steadily worse for decades.`

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
  const APP_VERSION = 'General V3'; // or 'v1-students', 'v1-donors', etc.
  const packageRef = React.useRef(null);
const directionRef = React.useRef(null);
const [isSubmittingQ2, setIsSubmittingQ2] = useState(false);
// eslint-disable-next-line no-unused-vars
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
const [isSubmittingRatings, setIsSubmittingRatings] = useState(false);

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



  // Use the pre-generated session_id from the state
  const session_id = sessionId;  // Use the pre-generated session_id from the state

  console.log('Using session_id for initial submission:', session_id);  // Debug log

 
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
  await createRecord('details', {
    session_id,
    fname,
    lname,
    email,
    zip,
  });
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

// --- helpers (place near top-level of component) ---
const getOrCreateRecordId = async (sessionId, initialFields = {}) => {
  const found = await selectRecords(
    'submissions',
    `{session_id} = "${sessionId}"`,
    1
  );

  if (found.length > 0) return found[0].id;

  const created = await createRecord('submissions', { session_id: sessionId, ...initialFields });
  return created[0].id;
};

const upsertFields = async (sessionId, fields) => {
  const recordId = await getOrCreateRecordId(sessionId);
  await updateRecord('submissions', recordId, fields);
};

// --- handler: Submit My Ratings ---
const handleSubmitRatings = async () => {
  if (isSubmittingRatings) return;
  setIsSubmittingRatings(true);

  // Build assignment once
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
      submitted_at: new Date().toISOString(),
    };
  });

  try {
    await upsertFields(sessionId, {
      assignment: JSON.stringify(assignmentArray),
      version: APP_VERSION,
      submitted_at: new Date().toISOString(),
    });

    setRatingsSubmitted(true);
    setReadyToSubmit(true);
    setReflectionStep(3); // keep your existing flow
  } catch (err) {
    console.error('Error upserting Submit My Ratings:', err);
  } finally {
    setIsSubmittingRatings(false);
  }
};

// --- handler: Q3 submit ---
const handleSubmitQ3 = async () => {
  if (isSubmittingQ3) return;
  setIsSubmittingQ3(true);

  try {
    await upsertFields(sessionId, {
      reflection_q3: (reflectionAnswers.q3 || '').toString(),
      submitted_at: new Date().toISOString(),
    });

    setReflectionStep(2);
    setShowDirectionPopup(false);
  } catch (err) {
    console.error('Error updating reflection_q3:', err);
  } finally {
    setIsSubmittingQ3(false);
  }
};

// --- handler: Q2 choose ---
const handleChooseQ2 = async (choice /* boolean: true=Grand Bargain, false=Whatever */) => {
  if (isSubmittingQ2 || reflectionAnswers.q2 !== '') return;
  setIsSubmittingQ2(true);

  try {
    await upsertFields(sessionId, {
      reflection_q2: choice ? 'true' : 'false',
      submitted_at: new Date().toISOString(),
    });

    setReflectionAnswers(prev => ({ ...prev, q2: choice }));
    if (choice === true) {
      setReflectionStep(0);
      setShowPackagePopup(true);
    } else {
      setShowDirectionPopup(true);
    }
  } catch (err) {
    console.error('Error updating reflection_q2:', err);
  } finally {
    setIsSubmittingQ2(false);
  }
};
  

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
        Americans seem to grow more divided each year. Yet we nearly all aspire for:
      </p>
      <p>
        <strong>Greater economic opportunity & growth</strong><br />
        <strong>Schools that enable our kids to reach their potential</strong><br />
        <strong>More effective & affordable healthcare</strong><br />
        <strong>Redirecting spending to lower the national debt</strong><br />
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
      <p>Each party enacts laws to satisfy its strongest supporters on some issues, while letting our overall problems grow worse.</p>
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
      <p><strong>To advance all six aspirations that Americans share,</strong> we gathered ideas from various groups concerned about those issues.</p>
      <p>We then distilled those ideas into 35 practical reforms that will:</p>
      <div className="leading-snug mt-[-0.5rem] font-bold">
        <p className="m-0">Yield major progress in each area</p>
        <p className="m-0">Work well together</p>
        <p className="m-0">Boost efficiency and lower costs</p>
        <p className="m-0">Significantly improve each American’s life</p>
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
      <p><strong>In a recent poll, 77% of Americans using this WebApp preferred this package of reforms over the country’s current direction.</strong></p>
      <p>That 77% far exceeds approval ratings for both political parties combined.</p>
      <p>To see for yourself how this Grand Bargain would be better for you than the country’s current direction, the next screens will ask you to:</p>
      <div className="leading-snug mt-[-0.5rem] ">
        <p className="m-0">1. Rate each reform</p>
        <p className="m-0">2. Suggest additions or changes</p>
        <p className="m-0">3. Evaluate the package</p>
        <p className="m-0">4. If you're interested, receive further information</p>
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
  <p>At the bottom of the page, you will see <strong>the 6 policy areas</strong>. Each is in a different color.</p>

  <div className="space-y-2">
    <p className="font-semibold">By clicking on each bar, you will see:</p>
    <ul className="list-disc pl-5 list-inside space-y-1 text-gray-700">
      <li>Description of the basic problem</li>
      <li><strong>Overall</strong> description of our proposals</li>
      <li>Description of <strong>each</strong> proposal</li>
      <div style={{ height: '0.5rem' }} />
      </ul>
      <strong>You can rate either: The overall proposal OR each <em>individual proposal</em></strong>
      <ul className="list-disc pl-5 list-inside space-y-1 text-gray-700">
    </ul>
  </div>

  <p className="font-semibold text-[#142d95]">Please focus on proposals that really matter to you.</p>
  <ul className="list-disc pl-5 list-inside space-y-1 text-gray-700">
  <li className="italic">Any that seem unclear or vague, just rate <strong>Not Sure</strong></li>
  </ul>
  <div style={{ height: '0.5rem' }} />


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

{!(readyToSubmit && reflectionStep === 2) && (
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
)}


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
        If you have changed your mind about any ratings, you can go to the top of the page to 'x' those proposals. Then, you can re-rate those items.
      </p>
      <p className="mb-4 text-lg text-gray-700">
        When you're ready, click <strong>Submit My Ratings</strong>.
      </p>
      <button
        onClick={handleSubmitRatings}
        disabled={isSubmittingRatings}
        className="bg-[#142d95] text-white px-6 py-3 rounded text-base font-semibold hover:bg-[#101761] transition"
      >
        {isSubmittingRatings ? 'Submitting...' : 'Submit My Ratings'}
      </button>
    </div>
  </div>
</div>

)}

{(reflectionStep === 2 || reflectionStep === 3) && (
  <div
    ref={reflectionStep2Ref}
    className="rounded-lg shadow-lg p-1 mb-6"
    style={{ background: 'linear-gradient(135deg, #e0f2f1, #e8f5e9, #ffffff)' }}
  >
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md space-y-5">
      {reflectionStep === 2 && (
        <div className="space-y-5 text-base sm:text-lg text-gray-800">
          <div className="rounded text-base sm:text-lg text-gray-800">
            <p className="text-base sm:text-lg font-bold mb-4">
              Our goal is to empower you — so you and your allies can tell lawmakers from both parties:
            </p>
            <p className="text-base sm:text-lg">
             <em>These reforms will advance the aspirations that Americans all share.</em>
            </p>
          <p className="text-base sm:text-lg mb-4">
             <em>Make this package a priority – or we'll elect someone who will.</em>
          </p>
          </div>
          <p className="text-base sm:text-lg mb-4">
            So, which would you prefer: Telling members of Congress to work on this evolving Grand Bargain – or leave it up to them to decide your future?
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-left">
            <button
              className={`px-5 py-2 rounded text-sm shadow ${
                reflectionAnswers.q2 === true
                  ? 'bg-[#142d95] text-white'
                  : 'bg-gray-300 hover:bg-[#142d95] hover:text-white'
              } transition`}
              disabled={reflectionAnswers.q2 !== '' || isSubmittingQ2}
              onClick={() => handleChooseQ2(true)}
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
              onClick={() => handleChooseQ2(false)}
            >
              {isSubmittingQ2 ? 'Submitting...' : 'Whatever Congress Decides'}
            </button>
          </div>
        </div>
      )}

      {reflectionStep === 3 && (
        <div>
          <p className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            The reforms that you rated positively have been around for years. Congress has enacted none of them.
          </p>
          <div className="text-base sm:text-lg space-y-3 mb-7 leading-relaxed">
            <p>The reason: Most Congresspeople blame the other party for our country’s ills and offer sound bites as remedies, instead of working together on genuine solutions.</p>
            <p>To fix this situation, we the American people need to find a total package that 75% or more of us support.</p>
            <p>To that end, we keep testing variations.</p>
            <p>In July, 77% of voters using this App saw the benefits as valuable enough to accept the drawbacks. They chose this package over the country’s current direction.</p>
            <p>We would welcome your ideas — for changes or additions — that might get more of the American people on board. Please type your suggestions in here.</p>
          </div>

          <textarea
            className="w-full border border-gray-300 rounded p-2 text-sm mb-4 space-y-3"
            rows={4}
            placeholder="Please type your suggestions here..."
            value={reflectionAnswers.q3}
            onChange={e => setReflectionAnswers(prev => ({ ...prev, q3: e.target.value }))}
          />
          <button
            className="bg-[#142d95] text-white px-4 py-2 rounded text-sm mb-4"
            onClick={handleSubmitQ3}
            disabled={isSubmittingQ3}
          >
            {isSubmittingQ3 ? 'Submitting...' : 'Next'}
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
    You see the value in the Grand Bargain. Please join us!
</p>
<p className="text-xl italic text-gray-700">
Sign our petition that will go to Congress and the Administration
<br /><br />
You will receive our newsletter & have the opportunity to become part of this national movement
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
              {category === 'Energy Policy' && (<> Encourage businesses, families, state governments and other countries to use energy efficiently by ending wasteful subsidies, mandates and regulations.  Reduce extreme droughts, floods, hurricanes, blizzards and wildfires by taxing carbon emissions. Transmit energy in ways that minimize the costs to consumers.</>)}
              {category === 'Taxes' && (<>To pay for the benefits in health, education and economic opportunity described in earlier sections, raise taxes on those who can most afford it. <br /><br />Eliminate complexity that invites tax evasion. Reward businesses for investing in assets that will increase productivity and future income. Make entitlement spending more efficient.</>)}
              {category === 'Federal Spending & Debt' && (<>To keep the debt at or below 100% of GDP, the government needs to boost revenue and/or cut spending by about $800 billion a year. To that end: <br /><br /> The reforms in the Healthcare section would boost productivity, yielding $200 billion in annual savings<br />Our proposal to end wasteful energy subsidies would save $200 billion yearly<br /> The 5% VAT and market-based carbon pricing would yield $400 billion in revenue<br /><br />And to pay for new investments in mobility, education and preventive care, our proposal to slash tax deductions for the well-off would provide $500 billion a year. <br /></>)}
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