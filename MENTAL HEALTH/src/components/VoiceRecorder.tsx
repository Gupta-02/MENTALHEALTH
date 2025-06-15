import { useState, useRef } from 'react';
import { useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';
import { MicrophoneIcon, StopIcon, PlayIcon } from '@heroicons/react/24/outline';

export function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const generateUploadUrl = useMutation(api.mentalHealth.generateVoiceUploadUrl);
  const processVoiceAnalysis = useAction(api.mentalHealth.processVoiceAnalysis);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const analyzeVoice = async () => {
    if (!audioBlob) return;

    setIsAnalyzing(true);
    try {
      // Upload audio file
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': audioBlob.type },
        body: audioBlob,
      });

      if (!result.ok) {
        throw new Error('Upload failed');
      }

      const { storageId } = await result.json();

      // Process voice analysis
      const analysis = await processVoiceAnalysis({
        audioFileId: storageId,
        language: 'en',
      });

      toast.success('Voice analysis completed!');
      console.log('Analysis result:', analysis);
    } catch (error) {
      toast.error('Failed to analyze voice. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const playRecording = () => {
    if (audioBlob && audioRef.current) {
      const url = URL.createObjectURL(audioBlob);
      audioRef.current.src = url;
      audioRef.current.play();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Voice Analysis
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Record your voice to analyze emotional patterns and speech characteristics.
        </p>
      </div>

      {/* Recording Controls */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <MicrophoneIcon className="w-5 h-5" />
                <span>Start Recording</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <StopIcon className="w-5 h-5" />
                <span>Stop Recording</span>
              </button>
            )}
          </div>

          {isRecording && (
            <div className="flex items-center space-x-2 text-red-500">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Recording in progress...</span>
            </div>
          )}
        </div>
      </div>

      {/* Audio Playback */}
      {audioBlob && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recorded Audio
          </h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={playRecording}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <PlayIcon className="w-4 h-4" />
              <span>Play</span>
            </button>
            <button
              onClick={analyzeVoice}
              disabled={isAnalyzing}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Voice'}</span>
            </button>
          </div>
          <audio ref={audioRef} className="hidden" />
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
          How Voice Analysis Works
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Record a short voice message (30-60 seconds recommended)</li>
          <li>• Our AI analyzes speech patterns, tone, and emotional indicators</li>
          <li>• Get insights about stress levels and emotional state</li>
          <li>• Use results to better understand your mental health patterns</li>
        </ul>
      </div>
    </div>
  );
}
