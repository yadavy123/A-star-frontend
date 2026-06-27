import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { blogApi } from '../../api/blogApi.ts';
import { Card, Button } from '../ui/index.tsx';
import { CheckCircle, XCircle, ArrowLeft, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export const UnsubscribePage = () => {
    const [searchParams] = useSearchParams();
    const emailParam = searchParams.get('email') || '';
    const [email, setEmail] = useState(emailParam);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (emailParam && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailParam)) {
            setEmail(emailParam);
        }
    }, [emailParam]);

    const handleUnsubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            toast.error('Please enter a valid email address.');
            return;
        }
        setLoading(true);
        try {
            await blogApi.unsubscribe({ email });
            setDone(true);
        } catch {
            toast.error('Failed to unsubscribe. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto px-6 py-20">
            <Link to="/blog" className="inline-flex items-center gap-2 text-base text-text-secondary hover:text-text-primary transition-colors mb-8">
                <ArrowLeft className="w-5 h-5" />
                Back to Blog
            </Link>

            <Card className="text-center rounded-2xl border border-border-primary p-8">
                {done ? (
                    <>
                        <CheckCircle className="w-14 h-14 mx-auto text-emerald-500 mb-4" />
                        <h1 className="text-2xl font-bold text-text-primary mb-2">Unsubscribed</h1>
                        <p className="text-text-secondary mb-1">
                            <strong>{email}</strong> has been unsubscribed.
                        </p>
                        <p className="text-text-secondary text-sm">You will no longer receive blog notification emails.</p>
                    </>
                ) : (
                    <>
                        <XCircle className="w-14 h-14 mx-auto text-red-400 mb-4" />
                        <h1 className="text-2xl font-bold text-text-primary mb-2">Unsubscribe</h1>
                        <p className="text-text-secondary mb-6">You'll stop receiving blog notification emails.</p>
                        <form onSubmit={handleUnsubscribe} className="space-y-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                                className="w-full border border-border-primary rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-text-tertiary transition-colors text-center"
                            />
                            <Button type="submit" variant="danger" disabled={loading} className="w-full">
                                {loading ? <><Loader className="w-4 h-4 animate-spin inline mr-2" />Processing...</> : 'Confirm Unsubscribe'}
                            </Button>
                        </form>
                    </>
                )}
            </Card>
        </div>
    );
};
