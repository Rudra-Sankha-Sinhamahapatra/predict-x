"use client";
import { useEffect, useState } from "react";

const TrophyIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zM8 6V6a2 2 0 114 0v1H8V6z" clipRule="evenodd" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const XCircleIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

type Topic = {
  id: string;
  title: string;
  category: string;
  status: "OPEN" | "CLOSED" | "RESOLVED";
  createdAt: string;
  createdBy: string;
  options: Array<{
    id: string;
    text: string;
    payout: number;
    voteCount: number;
    currentPayout: number;
  }>;
  totalVotes: number;
};

export default function AdminDashboard() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch("/api/topics");
      const data = await response.json();
      setTopics(data);
    } catch (error) {
      console.error("Failed to fetch topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const resolveTopic = async (topicId: string, winningOptionId: string) => {
    try {
      const response = await fetch(`/api/topics/${topicId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "RESOLVED",
          winningOptionId,
        }),
      });

      if (response.ok) {
        alert("Topic resolved successfully! Winnings have been distributed.");
        fetchTopics(); 
      } else {
        const error = await response.json();
        alert(`Failed to resolve topic: ${error.error}`);
      }
    } catch (error) {
      console.error("Error resolving topic:", error);
      alert("Failed to resolve topic");
    }
  };

  const updateTopicStatus = async (topicId: string, status: "OPEN" | "CLOSED") => {
    try {
      const response = await fetch(`/api/topics/${topicId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        alert(`Topic ${status.toLowerCase()} successfully!`);
        fetchTopics(); 
      } else {
        const error = await response.json();
        alert(`Failed to update topic: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating topic:", error);
      alert("Failed to update topic");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <TrophyIcon />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                PredictX Admin Dashboard
              </h1>
            </div>
            <p className="text-slate-600 ml-13">Manage prediction markets and resolve outcomes</p>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-slate-600 font-medium">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalTopics = topics.length;
  const openTopics = topics.filter(t => t.status === 'OPEN').length;
  const closedTopics = topics.filter(t => t.status === 'CLOSED').length;
  const resolvedTopics = topics.filter(t => t.status === 'RESOLVED').length;
  const totalVotes = topics.reduce((sum, topic) => sum + topic.totalVotes, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white">
              <TrophyIcon />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
              PredictX Admin Dashboard
            </h1>
          </div>
          <p className="text-slate-600 ml-13">Manage prediction markets and resolve outcomes</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ChartIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalTopics}</p>
                <p className="text-sm text-gray-600">Total Markets</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <PlayIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{openTopics}</p>
                <p className="text-sm text-gray-600">Active Markets</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <CheckCircleIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{resolvedTopics}</p>
                <p className="text-sm text-gray-600">Resolved</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <UsersIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalVotes}</p>
                <p className="text-sm text-gray-600">Total Votes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="space-y-6">
          {topics.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/50 shadow-lg">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChartIcon />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Markets Found</h3>
              <p className="text-gray-600">Create your first prediction market to get started.</p>
            </div>
          ) : (
            topics.map((topic) => (
              <div key={topic.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{topic.title}</h3>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">{topic.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UsersIcon />
                          <span>Total Votes: <span className="font-semibold">{topic.totalVotes}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon />
                          <span>Created: {new Date(topic.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                      topic.status === 'OPEN' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : topic.status === 'CLOSED' 
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {topic.status === 'OPEN' && <PlayIcon />}
                      {topic.status === 'CLOSED' && <PauseIcon />}
                      {topic.status === 'RESOLVED' && <CheckCircleIcon />}
                      {topic.status}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ChartIcon />
                      Betting Options
                    </h4>
                    <div className="grid gap-4">
                      {topic.options.map((option) => (
                        <div key={option.id} className="bg-white/50 rounded-xl p-6 border border-white/30 hover:bg-white/80 transition-all duration-200">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="font-semibold text-gray-900 text-lg">{option.text}</h5>
                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{option.voteCount}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Votes</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{option.currentPayout.toFixed(2)}x</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Payout</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Vote percentage bar */}
                          <div className="mb-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${topic.totalVotes > 0 ? (option.voteCount / topic.totalVotes) * 100 : 0}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {topic.totalVotes > 0 ? ((option.voteCount / topic.totalVotes) * 100).toFixed(1) : 0}% of total votes
                            </p>
                          </div>

                          {topic.status === 'OPEN' && (
                            <button
                              onClick={() => resolveTopic(topic.id, option.id)}
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                            >
                              <TrophyIcon />
                              Mark as Winner & Resolve Market
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {(topic.status === 'OPEN' || topic.status === 'CLOSED') && (
                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                      {topic.status === 'OPEN' && (
                        <button
                          onClick={() => updateTopicStatus(topic.id, 'CLOSED')}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          <PauseIcon />
                          Close Betting
                        </button>
                      )}

                      {topic.status === 'CLOSED' && (
                        <button
                          onClick={() => updateTopicStatus(topic.id, 'OPEN')}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          <PlayIcon />
                          Reopen Betting
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
