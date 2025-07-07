import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Flame, Target, TrendingUp, Award, Star, ChevronRight, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReminderSettingsModal, ReminderSettings } from './ReminderSettingsModal';

interface JournalEngagementFeaturesProps {
  totalEntries: number;
  currentStreak: number;
  weeklyGoal: number;
  entriesThisWeek: number;
  insights: string[];
  achievements: Achievement[];
  onViewInsights: () => void;
  onSetReminder: () => void;
  onUpdateWeeklyGoal: (newGoal: number) => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export const JournalEngagementFeatures: React.FC<JournalEngagementFeaturesProps> = ({
  totalEntries,
  currentStreak,
  weeklyGoal,
  entriesThisWeek,
  insights,
  achievements,
  onViewInsights,
  onSetReminder,
  onUpdateWeeklyGoal
}) => {
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [newGoal, setNewGoal] = useState(weeklyGoal);
  
  const weeklyProgress = useMemo(() => (entriesThisWeek / weeklyGoal) * 100, [entriesThisWeek, weeklyGoal]);
  const recentAchievements = useMemo(() => achievements.filter(a => a.unlocked).slice(0, 3), [achievements]);

  const handleReminderSave = (settings: ReminderSettings) => {
    // This would integrate with a notification system
    onSetReminder();
  };

  return (
    <div className="space-y-6">
      {/* Streak & Progress Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Current Streak */}
        <div className="journal-premium-card p-5 group hover:journal-metric-glow transition-all duration-300">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Flame className="h-5 w-5 text-orange-400" />
            </div>
            <span className="text-orange-400 font-medium tracking-wide">Streak</span>
          </div>
          <div className="text-3xl font-display font-bold text-white group-hover:text-orange-400 transition-colors">
            {currentStreak}
          </div>
          <div className="text-sm text-orange-300/80 font-light">days in a row</div>
        </div>

        {/* Weekly Goal */}
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Weekly Goal</span>
              </div>
              <button
                onClick={() => setShowGoalEditor(true)}
                className="p-1 text-green-400 hover:text-green-300 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
            <div className="text-2xl font-bold text-white">{entriesThisWeek}/{weeklyGoal}</div>
            <Progress value={weeklyProgress} className="h-2 mt-1" />
          </CardContent>
        </Card>
      </div>

      {/* Goal Editor Modal */}
      <Dialog open={showGoalEditor} onOpenChange={setShowGoalEditor}>
        <DialogContent className="bg-charcoal-gray border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Weekly Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm">Journal entries per week</label>
              <Input
                type="number"
                min="1"
                max="7"
                value={newGoal}
                onChange={(e) => setNewGoal(parseInt(e.target.value) || 1)}
                className="bg-jet-black border-gray-700 text-white mt-1"
              />
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowGoalEditor(false)}
                className="flex-1 border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onUpdateWeeklyGoal(newGoal);
                  setShowGoalEditor(false);
                }}
                className="flex-1 bg-goldenrod hover:bg-goldenrod/90 text-jet-black"
              >
                Save Goal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Personal Insights Preview */}
      <Card className="bg-charcoal-gray border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-goldenrod" />
              <span>Your Dating Insights</span>
            </div>
            <button
              onClick={onViewInsights}
              className="text-goldenrod hover:text-goldenrod/80 text-sm flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.slice(0, 2).map((insight, index) => (
            <div key={index} className="p-3 bg-jet-black rounded-lg border border-gray-700">
              <p className="text-gray-300 text-sm">{insight}</p>
            </div>
          ))}
          {insights.length === 0 && (
            <p className="text-gray-400 text-sm italic">Complete more journal entries to unlock personalized insights about your dating patterns.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card className="bg-charcoal-gray border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-goldenrod" />
              <span>Recent Achievements</span>
            </div>
            <button
              onClick={() => setShowAllAchievements(!showAllAchievements)}
              className="text-goldenrod hover:text-goldenrod/80 text-sm flex items-center space-x-1"
            >
              <span>{showAllAchievements ? 'Show Less' : 'View All'}</span>
              <ChevronRight className={`h-4 w-4 transition-transform ${showAllAchievements ? 'rotate-90' : ''}`} />
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(showAllAchievements ? achievements : recentAchievements).map((achievement) => (
            <div
              key={achievement.id}
              className={`p-3 rounded-lg border ${
                achievement.unlocked
                  ? 'bg-goldenrod/10 border-goldenrod/30'
                  : 'bg-gray-800/50 border-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`text-2xl ${achievement.unlocked ? 'grayscale-0' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${achievement.unlocked ? 'text-goldenrod' : 'text-gray-400'}`}>
                    {achievement.title}
                  </h4>
                  <p className="text-gray-400 text-xs">{achievement.description}</p>
                  {achievement.progress !== undefined && achievement.maxProgress && (
                    <div className="mt-1">
                      <Progress
                        value={(achievement.progress / achievement.maxProgress) * 100}
                        className="h-1"
                      />
                      <span className="text-xs text-gray-500">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                  )}
                </div>
                {achievement.unlocked && (
                  <Badge className="bg-goldenrod/20 text-goldenrod border-goldenrod/30">
                    Unlocked!
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowReminderSettings(true)}
          className="p-4 bg-charcoal-gray border border-gray-700 rounded-xl text-left hover:border-goldenrod/50 transition-colors"
        >
          <Calendar className="h-5 w-5 text-goldenrod mb-2" />
          <div className="text-white text-sm font-medium">Set Reminder</div>
          <div className="text-gray-400 text-xs">Daily journal prompts</div>
        </button>
        
        <button
          onClick={onViewInsights}
          className="p-4 bg-charcoal-gray border border-gray-700 rounded-xl text-left hover:border-goldenrod/50 transition-colors"
        >
          <Star className="h-5 w-5 text-goldenrod mb-2" />
          <div className="text-white text-sm font-medium">Growth Tracker</div>
          <div className="text-gray-400 text-xs">See your progress</div>
        </button>
      </div>

      {/* Reminder Settings Modal */}
      <ReminderSettingsModal
        isOpen={showReminderSettings}
        onClose={() => setShowReminderSettings(false)}
        onSave={handleReminderSave}
      />
    </div>
  );
};