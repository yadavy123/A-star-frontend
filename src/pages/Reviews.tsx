import { useState, useEffect, Fragment, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Star, Quote, Loader2 } from 'lucide-react';
import * as reviewApi from '../api/api/reviewApi';
import toast from 'react-hot-toast';

interface Review {
    id: string;
    studentName: string;
    parentName: string;
    gradeOrClass: string;
    reviewText: string;
    overallRating: number;
    teachingQuality?: number;
    personalAttention?: number;
    testSystem?: number;
    overallExperience?: number;
    conceptClarity?: number;
    doubtSolving?: number;
    studyMaterial?: number;
    improvementInConfidence?: number;
    structuredPlanning?: number;
    examOrientedPractice?: number;
    reinforcementClasses?: number;
    overallSatisfaction?: number;
    batchSizeAdvantage?: number;
    individualMonitoring?: number;
    teacherExperience?: number;
    resultImprovement?: number;
    status?: string;
    submittedAt?: string;
    publishedAt?: string;
    createdAt?: string;
}

const ratingLabels = {
    teachingQuality: "Teaching Quality",
    personalAttention: "Personal Attention",
    testSystem: "Test System",
    overallExperience: "Overall Experience",
    conceptClarity: "Concept Clarity",
    doubtSolving: "Doubt Solving",
    studyMaterial: "Study Material",
    improvementInConfidence: "Improvement in Confidence",
    structuredPlanning: "Structured Planning",
    examOrientedPractice: "Exam-Oriented Practice",
    reinforcementClasses: "Reinforcement Classes",
    overallSatisfaction: "Overall Satisfaction",
    batchSizeAdvantage: "Batch Size Advantage",
    individualMonitoring: "Individual Monitoring",
    teacherExperience: "Teacher Experience",
    resultImprovement: "Result Improvement"
};

const Reviews = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [avgRating, setAvgRating] = useState(0);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const data = await reviewApi.getPublishedReviews({ page, size: 9 });
            const content = Array.isArray(data) ? data : (data.content || []);
            setReviews(content);
            setTotalPages(data.totalPages || (Array.isArray(data) ? 1 : 0));
            setTotalElements(data.totalElements || content.length);
            setAvgRating(
                content.length > 0
                    ? Math.round((content.reduce((s: number, r: Review) => s + (r.overallRating || 0), 0) / content.length) * 10) / 10
                    : 0
            );
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    }, [page]);

    const getRatingsArray = (review: Review) => {
        return (Object.keys(ratingLabels) as Array<keyof Review>)
            .filter((key) => typeof review[key] === 'number')
            .map((key) => ({
                label: ratingLabels[key as keyof typeof ratingLabels],
                score: (review[key] as number) || 0
            }))
            .filter(r => r.score > 0);
    };

    const chunkArray = (array: Review[], size: number) => {
        const chunks: Review[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    };

    const reviewGroups = chunkArray(reviews, 6);

    return (
        <div className="min-h-screen bg-[#fcfcfc] font-sans overflow-x-hidden">
            {/* Header Section */}
            <section className="pt-14 sm:pt-16 pb-6 px-4 text-center max-w-7xl mx-auto">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1e3a8a] mb-3 leading-tight tracking-tight">
                    Student Reviews
                </h1>
                <p className="text-base sm:text-lg text-gray-500 max-w-3xl mx-auto font-medium mb-6">
                    Hear what our students have to say about their learning experience with A Star Classes
                </p>

                {/* Stats Banner */}
                {!loading && totalElements > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto mb-6">
                        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                            <p className="text-lg sm:text-xl md:text-2xl font-black text-[#1e3a8a]">{totalElements}</p>
                            <p className="text-[11px] sm:text-xs font-bold text-gray-500 mt-1">Total Reviews</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-1.5 sm:gap-2 justify-center">
                                <span className="text-lg sm:text-xl md:text-2xl font-black text-[#f59e0b]">{avgRating}</span>
                                <Star size={16} fill="#f59e0b" className="text-amber-500" />
                            </div>
                            <p className="text-[11px] sm:text-xs font-bold text-gray-500 mt-1">Average Rating</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                            <p className="text-lg sm:text-xl md:text-2xl font-black text-green-600">{totalPages}</p>
                            <p className="text-[11px] sm:text-xs font-bold text-gray-500 mt-1">Pages</p>
                        </div>
                    </div>
                )}

                {/* Main Action Box */}
                <div className="bg-[#f8f9fb] rounded-xl md:rounded-[24px] p-4 sm:p-6 max-w-4xl mx-auto shadow-sm border border-gray-100 mb-8">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                        <button 
                            onClick={() => document.getElementById('reviews-grid')?.scrollIntoView({ behavior: 'smooth' })}
                            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-[#1e3a8a] text-white rounded-xl md:rounded-[16px] font-black text-base sm:text-lg hover:bg-[#162d6b] transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                        >
                            Explore Reviews
                        </button>
                        <Link
                            to="/write-review"
                            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-[#f59e0b] text-white rounded-xl md:rounded-[16px] font-black text-base sm:text-lg hover:bg-[#d97706] transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                        >
                            Write a Review
                        </Link>
                    </div>
                </div>

                {/* Reviews Grid */}
                <div id="reviews-grid" className="max-w-[1600px] mx-auto px-4 pb-12">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-10 h-10 text-[#1e3a8a] animate-spin mb-3" />
                            <p className="text-lg font-bold text-gray-400">Loading reviews...</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl md:rounded-[24px] border-2 border-dashed border-gray-200">
                            <p className="text-lg sm:text-xl font-bold text-gray-400">No reviews found yet.</p>
                            <Link to="/write-review" className="inline-block mt-3 sm:mt-4 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#f59e0b] text-white rounded-[16px] font-bold text-sm sm:text-base hover:bg-[#d97706] transition-all">
                                Be the first to review
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                {reviewGroups.map((group, groupIndex) => (
                                    <Fragment key={`group-${groupIndex}`}>
                                        {group.map((review, index) => (
                                            <div key={review.id || `${groupIndex}-${index}`} className="bg-white rounded-xl md:rounded-[24px] border border-gray-100 shadow-lg shadow-gray-200/50 flex flex-col h-full overflow-hidden group hover:border-blue-100 transition-colors">
                                                {/* Card Content Top */}
                                                <div className="p-3 sm:p-5 md:p-6 pb-4 text-center">
                                                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-[#1e3a8a] mb-1.5 leading-tight">{review.studentName}</h3>
                                                    <p className="text-[#5c7cbd] font-semibold text-xs sm:text-sm mb-3 sm:mb-4 tracking-wide uppercase">{review.gradeOrClass}</p>
                                                    <div className="relative">
                                                        <Quote className="absolute -top-2 -left-2 w-6 h-6 sm:w-8 sm:h-8 text-blue-50 opacity-50" />
                                                        <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed relative z-10">
                                                            "{review.reviewText}"
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Ratings Section */}
                                                <div className="mx-2 sm:mx-4 mb-2 sm:mb-3 p-2 sm:p-5 bg-[#f8f9fb] rounded-xl md:rounded-[20px] border border-gray-50 flex-1">
                                                    <h4 className="text-[9px] sm:text-[10px] font-black text-[#999] tracking-[0.15em] uppercase mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
                                                        DETAILED RATINGS <div className="flex-1 h-px bg-gray-200"></div>
                                                    </h4>
                                                    <div>
                                                        {getRatingsArray(review).map((rating, idx) => (
                                                             <Fragment key={`rating-${idx}`}>
                                                                <div className="grid grid-cols-[1fr_auto] items-center gap-1.5 sm:gap-2 group/item py-1 sm:py-1.5">
                                                                    <span className="text-[#444] text-[11px] sm:text-sm font-semibold leading-tight group-hover/item:text-[#1e3a8a] transition-colors text-left">
                                                                        {rating.label}:
                                                                </span>
                                                                    <div className="flex gap-0.5">
                                                                        {[1, 2, 3, 4, 5].map(s => (
                                                                            <Star 
                                                                                key={s} 
                                                                                size={10} 
                                                                                fill={s <= rating.score ? "#f59e0b" : "none"} 
                                                                                className={s <= rating.score ? "text-amber-500" : "text-gray-200"} 
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                {(idx + 1) % 4 === 0 && idx !== getRatingsArray(review).length - 1 && (
                                                                    <div className="h-px bg-gray-200 my-1" />
                                                                )}
                                                             </Fragment>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Footer Section */}
                                                <div className="px-3 sm:px-5 md:px-6 pb-4 md:pb-6 pt-3 text-left">
                                                    <div className="h-px bg-gray-100 mb-3 sm:mb-4 w-full"></div>
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 sm:gap-2 mb-2">
                                                            <span className="text-[#1e3a8a] text-base sm:text-lg font-black">Overall Rating:</span>
                                                        <div className="flex gap-0.5 sm:gap-1">
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <Star 
                                                                    key={s} 
                                                                    size={16} 
                                                                    fill={s <= (review.overallRating || 5) ? "#f59e0b" : "none"} 
                                                                    className={s <= (review.overallRating || 5) ? "text-amber-500" : "text-gray-200"} 
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-400 text-xs sm:text-sm font-medium tracking-tight">
                                                        {new Date(review.submittedAt || review.publishedAt || review.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {groupIndex !== reviewGroups.length - 1 && (
                                            <div key={`group-divider-${groupIndex}`} className="col-span-full h-px border-t border-gray-300 my-4 sm:my-6" />
                                        )}
                                    </Fragment>
                                ))}
                            </div>
                            
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <button 
                                            disabled={page === 0}
                                            onClick={() => setPage(p => p - 1)}
                                            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-[#1e3a8a] text-sm sm:text-base hover:bg-gray-50 disabled:opacity-50 transition-all flex-1 sm:flex-none"
                                        >
                                            Previous
                                        </button>
                                        <span className="flex items-center px-4 sm:px-6 font-bold text-gray-500 text-sm sm:text-base whitespace-nowrap">
                                            Page {page + 1} of {totalPages}
                                        </span>
                                        <button 
                                            disabled={page === totalPages - 1}
                                            onClick={() => setPage(p => p + 1)}
                                            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-[#1e3a8a] text-sm sm:text-base hover:bg-gray-50 disabled:opacity-50 transition-all flex-1 sm:flex-none"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Reviews;
