import React, { useState, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import proposalsData from './proposals_by_category.json';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import logo from './assets/logo.png';

// Initialize the Supabase client
const supabase = createClient(
  'https://xlnuivlsdzwbejkfeijh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsbnVpdmxzZHp3YmVqa2ZlaWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTc0NjUsImV4cCI6MjA1ODU3MzQ2NX0.q8DlJA3ouiwbNlwa5rF5Mq2zfo27ptL6NauLdWRhm2c'
);

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
  'Federal Spending & Debt',
  'Taxes',
];

const categoryColors = {
  'Economic Mobility and Growth': '#4a6ab2',
  'K-12 Education': '#46af93',
  'Healthcare': '#cdc04b',
  'Energy Policy': '#bd5aa7',
  'Federal Spending & Debt': '#7c4fbd',
  'Taxes': '#bd4f4f',
};

const positiveBuckets = ['Critical to Me & Others', 'Good Idea'];
const neutralBuckets = ['Not Sure'];
const negativeBuckets = ['Dislike It', 'Hate It'];

function App() {
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [introStep, setIntroStep] = useState(1);
  const [assignments, setAssignments] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [formData, setFormData] = useState({ fname: '', lname: '', email: '' });
  const [submitted, setSubmitted] = useState(false);
  const [reflectionStep, setReflectionStep] = useState(1);
  const [sessionId, setSessionId] = useState(null);
  const [showPackagePopup, setShowPackagePopup] = useState(false);
  const [showDirectionPopup, setShowDirectionPopup] = useState(false);
  const packageRef = React.useRef(null);
const directionRef = React.useRef(null);

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
    q1: '',
    q2: '',
    q3: ''
    
  });

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

  const handleFinalReflectionSubmit = async () => {
  const { fname, lname, email } = formData;
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
      submitted_at: new Date().toISOString(),
      reflection_q1: reflectionAnswers.q1,
      reflection_q2: reflectionAnswers.q2,
      reflection_q3,  // reflection_q3 is null
      session_id  // Include session_id here
    };
  });

  const payload = {
    session_id,  // Ensure session_id is included here
    fname: null,  // Empty fname
    lname: null,  // Empty lname
    email: null,  // Empty email
    assignment: JSON.stringify(assignmentArray),
    reflection_q1: reflectionAnswers.q1,
    reflection_q2: reflectionAnswers.q2,
    reflection_q3,  // reflection_q3 is null
    submitted_at: new Date().toISOString(),
  };

  // Additional Debugging
  console.log('Session ID:', session_id);
  console.log('Assignment Array:', JSON.stringify(assignmentArray, null, 2));
  console.log('Payload being sent to Supabase:', JSON.stringify(payload, null, 2));

  try {
    const { data, error } = await supabase.from('submissions').insert([payload]);
  
    if (error) {
      console.error('Error submitting reflection:', error);
    }
  } catch (err) {
    console.error('Unexpected error submitting reflection:', err);
  }
};

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    const { fname, lname, email } = formData;

    console.log('State before final submit:', { sessionId });  // Debug log

    const session_id = sessionId;  // Use the pre-generated session_id from the state

    if (!session_id) {
      console.error('Missing session_id:', { session_id });
      return;
    }

    console.log('Session ID for details submission:', session_id);  // Debug log

    // Insert the name and email into the 'details' table with the correct session_id (UUID)
    const { data, error } = await supabase.from('details').insert([
      {
        session_id,  // Use the pre-generated session_id (UUID)
        fname,
        lname,
        email,
      }
    ]);

    if (error) {
      console.error('Error inserting details:', error.message);  // More detailed error logging
    } else {
      console.log('Details submission successful:', data);  // Debug log
      setSubmitted(true);  // Set submission status to true after successful update
    }
  };

  const isAssigned = (proposalId) => assignments.hasOwnProperty(proposalId);
  const totalAssigned = Object.keys(assignments).length;
  const totalProposals = Object.values(proposalsData).flat().length;
  const progressPercent = (totalAssigned / totalProposals) * 100;
  const showForm = totalAssigned === totalProposals && !submitted;

  const bucketCounts = buckets.reduce((acc, b) => {
    acc[b] = Object.values(assignments).filter(v => v === b).length;
    return acc;
  }, {});

  const totalPositive = positiveBuckets.reduce((sum, b) => sum + bucketCounts[b], 0);
  const totalNeutral = neutralBuckets.reduce((sum, b) => sum + bucketCounts[b], 0);
  const totalNegative = negativeBuckets.reduce((sum, b) => sum + bucketCounts[b], 0);

  const pieData = {
    labels: buckets,
    datasets: [
      {
        data: buckets.map(b => bucketCounts[b]),
        backgroundColor: ['#4a6ab2', '#46af93', '#cdc04b', '#bd5aa7', '#bd4f4f'],
        borderWidth: 1,
      }
    ]
  };

  const averageVector = [8, 10, 6, 5, 5];
  const userVector = buckets.map(b => bucketCounts[b] || 0);
  const sumAvg = averageVector.reduce((a, b) => a + b, 0);
  const sumUser = userVector.reduce((a, b) => a + b, 0);

  const comparisonData = buckets.map((bucket, i) => ({
    bucket,
    'All Users': Math.round((averageVector[i] / sumAvg) * 100),
    'You': Math.round((userVector[i] / sumUser) * 100),
  }));

  return (
    <>
      {showIntroModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-start justify-center overflow-y-auto min-h-screen pt-10">
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-2xl p-4 sm:p-6 text-lg text-gray-800 space-y-4">
          {introStep === 1 && (
  <>
    <p>
      <strong>The Grand Bargain Project</strong> is designed to unite the American people around a practical plan to advance six economic aspirations we nearly all share.</p>
      <p>Among the following aspirations, which are important to you? Do you expect Congress to implement any of them?</p>
      <div className="overflow-x-auto max-h-[350px] sm:max-h-[none] overflow-y-auto">
  <table className="w-full text-sm text-left text-gray-700 border mt-4">
        <thead className="bg-gray-100 text-xs uppercase">
          <tr>
            <th className="px-4 py-2">Aspirations</th>
            <th className="px-4 py-2 text-center">Important to Me?</th>
            <th className="px-4 py-2 text-center">Congress Will Implement?</th>
          </tr>
        </thead>
        <tbody>
        {[
  { key: 'economic', label: 'Boosting economic opportunity, productivity, and growth' },
  { key: 'education', label: 'Reforming education so students reach their potential' },
  { key: 'healthcare', label: 'Making healthcare more effective and less costly' },
  { key: 'debt', label: 'Curbing the national debt' },
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
  
    </div>

    <div className="text-right mt-4">
    <button
  className="bg-[#142d95] text-white px-4 py-2 rounded text-sm"
  onClick={async () => {
    setIntroStep(2); // move to the next step

    try {
      const { error } = await supabase.from('introreflections').insert([
        {
          session_id: sessionId,
          intro_reflections: aspirationAnswers
        }
      ]);

      if (error) {
        console.error('Error saving intro reflections:', error);
      } else {
        console.log('Intro reflections saved');
      }
    } catch (err) {
      console.error('Unexpected error saving intro reflections:', err);
    }
  }}
>
  Next
</button>
    </div>
  </>
)}

      {introStep === 2 && (
        <>
          <p><strong>To move forward in all six areas simultaneously,</strong> we selected 46 reforms from various sources. Our purpose: that the overall package benefit each of us far more, and at lower cost, than current policies.</p>

            <p>We want your reactions to each proposal and to the overall package.</p>
            <p><strong>You may reject the first few items you see on the next page.</strong> But please review the total package before deciding whether it would be worthwhile for you. After all, Americans strongly disagree about many things, yet we agree on the need to advance these six goals. So, if we can agree that these 46 reforms are far better than our country’s current direction, we can tell politicians from both parties:</p>
          <p><em>Your constituents nearly all want this. If you want to stay in office, you need to put it front and center.</em></p>
          <p>To reach that day quickly, please give us your thoughts on the current package of reforms.</p>
          <div className="text-right">
            <button className="bg-[#142d95] text-white px-4 py-2 rounded text-sm" onClick={() => setShowIntroModal(false)}>Begin</button>
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

      {!submitted && !(totalAssigned === totalProposals && (reflectionAnswers.q1 !== '')) && (
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
            {reflectionStep === 1 && (
              <div>
                <p className="mb-4 text-lg font-medium text-gray-800">
                  1. Do you expect the current Congress and Administration to implement any of the reforms you see as critical or a good idea?

                </p>
                <div className="flex gap-4">
                <button
  className={`px-4 py-2 rounded text-sm ${
    reflectionAnswers.q1 === true
      ? 'bg-[#142d95] text-white'
      : 'bg-gray-300 hover:bg-[#142d95] hover:text-white'
  }`}
  disabled={reflectionAnswers.q1 !== ''}
  onClick={() => {
    setReflectionAnswers(prev => ({ ...prev, q1: true }));
    setReflectionStep(2);
  }}
>
  Yes
</button>

<button
  className={`px-4 py-2 rounded text-sm ${
    reflectionAnswers.q1 === false
      ? 'bg-[#142d95] text-white'
      : 'bg-gray-300 hover:bg-[#142d95] hover:text-white'
  }`}
  disabled={reflectionAnswers.q1 !== ''}
  onClick={() => {
    setReflectionAnswers(prev => ({ ...prev, q1: false }));
    setReflectionStep(2);
  }}
>
  No
</button>
                </div>
              </div>
            )}
            {reflectionAnswers.q1 !== '' && (
  <div className="mb-6">
    <p className="mb-2 text-lg font-medium text-gray-800">
      1. Do you expect the current Congress and Administration to implement any of the reforms you see as critical or a good idea?
    </p>
    <div className="flex gap-4">
      <button
        className={`px-4 py-2 rounded text-sm ${
          reflectionAnswers.q1 === true
            ? 'bg-[#142d95] text-white'
            : 'bg-gray-300'
        }`}
        disabled
      >
        Yes
      </button>
      <button
        className={`px-4 py-2 rounded text-sm ${
          reflectionAnswers.q1 === false
            ? 'bg-[#142d95] text-white'
            : 'bg-gray-300'
        }`}
        disabled
      >
        No
      </button>
    </div>
  </div>
)}

            {reflectionStep === 2 && (
              <div>
                <p className="mb-4 text-lg font-medium text-gray-800">
                  2. Thank you for sorting all 46 reforms into those you favor and those you don’t. If you had to choose between the overall package and the country's current direction, which would it be?
                </p>
                <div className="flex gap-4">
                <button
  className={`px-4 py-2 rounded text-sm ${
    reflectionAnswers.q2 === true
      ? 'bg-[#142d95] text-white'
      : 'bg-gray-300 hover:bg-[#142d95] hover:text-white'
  }`}
  disabled={reflectionAnswers.q2 !== ''}
  onClick={async () => {
    if (reflectionAnswers.q2 !== '') return;

    const updatedAnswers = {
      ...reflectionAnswers,
      q2: true,
    };
    setReflectionAnswers(updatedAnswers);

    const { fname, lname, email } = formData;

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
        fname,
        lname,
        email,
        submitted_at: new Date().toISOString()
      };
    });

    const { error } = await supabase.from('submissions').insert([
      {
        session_id: sessionId,
        fname,
        lname,
        email,
        assignment: JSON.stringify(assignmentArray),
        reflection_q1: reflectionAnswers.q1,
        reflection_q2: true,
        reflection_q3: '',
        submitted_at: new Date().toISOString()
      }
    ]);

    if (error) {
      console.error('Error submitting reflection:', error);
    } else {
      setReflectionStep(0);
      setShowPackagePopup(true);
    }
  }}
>
  Total Package
</button>

<button
  className={`px-4 py-2 rounded text-sm ${
    reflectionAnswers.q2 === false
      ? 'bg-[#142d95] text-white'
      : 'bg-gray-300 hover:bg-[#142d95] hover:text-white'
  }`}
  disabled={reflectionAnswers.q2 !== ''}
  onClick={() => {
    if (reflectionAnswers.q2 !== '') return;

    setReflectionAnswers(prev => ({ ...prev, q2: false }));
    setReflectionStep(3); // Move to Q3
  }}
>
Current Direction
</button>
                </div>
              </div>
            )}
{reflectionAnswers.q2 !== '' && (
  <div className="mb-6">
    <p className="mb-2 text-lg font-medium text-gray-800">
      2. Thank you for sorting all 46 reforms into those you favor and those you don’t. If you had to choose between the overall package and the country's current direction, which would it be?
    </p>
    <div className="flex gap-4">
      <button
        className={`px-4 py-2 rounded text-sm ${
          reflectionAnswers.q2 === true
            ? 'bg-[#142d95] text-white'
            : 'bg-gray-300'
        }`}
        disabled
      >
        Total Package
      </button>
      <button
        className={`px-4 py-2 rounded text-sm ${
          reflectionAnswers.q2 === false
            ? 'bg-[#142d95] text-white'
            : 'bg-gray-300'
        }`}
        disabled
      >
        Current Direction
      </button>
    </div>
  </div>
)}
            {reflectionStep === 3 && (
              <div>
                <p className="mb-4 text-lg font-medium text-gray-800">
                  3. What changes would get you to choose the 'Total Package' – which you also think most of the country would accept?
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
                    const { fname, lname, email } = formData;

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
                        fname,
                        lname,
                        email,
                        submitted_at: new Date().toISOString()
                      };
                    });

                    const { error } = await supabase.from('submissions').insert([
                      {
                        session_id: sessionId,  // ✅ ADD THIS
                        fname,
                        lname,
                        email,
                        assignment: JSON.stringify(assignmentArray),
                        reflection_q1: reflectionAnswers.q1,
                        reflection_q2: reflectionAnswers.q2,
                        reflection_q3: reflectionAnswers.q3,
                        submitted_at: new Date().toISOString()
                      }
                    ]);

                    if (error) {
                      console.error('Error submitting reflection:', error);
                    } else {
                      setReflectionStep(0);
                      setShowDirectionPopup(true);
                    }
                  }}
                >
  Submit Reflection
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
    Thank you for seeing the value in the current Grand Bargain.
</p>
<p className="text-xl italic text-gray-700">
So that we can build a national movement, please sign our petition that we will send to Congress and the Administration
</p>
    <div className="h-4" /> {/* Spacer */}
  </>
)}

      {/* Email Submission Form */}
      {!submitted && (
        <form onSubmit={handleFinalSubmit} className="space-y-4">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label htmlFor="fname" className="text-sm font-medium text-gray-800">First Name</label>
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
              <label htmlFor="lname" className="text-sm font-medium text-gray-800">Last Name</label>
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
              <label htmlFor="email" className="text-sm font-medium text-gray-800">Email</label>
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
              <label htmlFor="fname" className="text-sm font-medium text-gray-800">First Name</label>
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
              <label htmlFor="lname" className="text-sm font-medium text-gray-800">Last Name</label>
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
              <label htmlFor="email" className="text-sm font-medium text-gray-800">Email</label>
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
  </div>
)}
    </div>
  </div>
  </div>
)}

      {!submitted && totalAssigned < totalProposals && (
  <p className="text-lg font-bold mb-4">
    Please click on the policy areas below, and rate each proposal in one of the 5 categories above.
  </p>
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
      {expandedCategories[category] && remainingProposals.length > 0 && (
        <div className="grid grid-cols-1 gap-4 mt-4">
          {remainingProposals.map(({ id, title }) => (
            <div
              key={id}
              className="bg-white border border-gray-200 p-4 rounded shadow hover:shadow-md text-sm"
            >
              <p className="font-bold text-base mb-2">{title}</p>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
})}
    </div>
  </>
)};

export default App;