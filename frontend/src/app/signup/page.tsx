'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Store, Mail, Lock, ArrowRight, UtensilsCrossed, Sparkles, Check } from 'lucide-react';
import { SPACING, COLORS, RADIUS, TYPOGRAPHY, FONT_SIZES, SHADOWS } from '@/lib/constants';
import { REVEAL_UP } from '@/lib/animations';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/layout';

const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),

  cafeName: z
    .string()
    .min(2, 'Cafe name must be at least 2 characters')
    .max(100, 'Cafe name must be less than 100 characters'),

  email: z
    .string()
    .email('Please enter a valid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),

  agreedToTerms: z
    .boolean()
    .refine((value) => value === true, {
      message: 'You must agree to the terms and conditions',
    }),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signup, user, isLoading } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      cafeName: '',
      email: '',
      password: '',
      agreedToTerms:false
    },
  });

  const agreedToTerms = watch('agreedToTerms');

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return null;
  }

  if (user) {
    return null;
  }

  const onSubmit = async (data: SignupFormData) => {
    if (!agreedToTerms) {
      showToast('error', 'Terms Required', 'You must agree to the terms and conditions');
      return;
    }
    setIsSubmitting(true);
    try {
      await signup({
        fullName: data.fullName,
        cafeName: data.cafeName,
        email: data.email,
        password: data.password,
        agreedToTerms : data.agreedToTerms
      });
      showToast('success', 'Welcome to MenuMind', 'Account created successfully');
      router.push('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      showToast('error', 'Signup failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFormSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    handleSubmit(onSubmit)(e);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.BACKGROUND,
      display: 'flex',
      overflowX: 'hidden',
    }}>
      {/* Left Decorative Side (Web Only) */}
      <motion.div
        variants={REVEAL_UP}
        initial="hidden"
        animate="visible"
        style={{
          display: 'none',
          width: '50%',
          position: 'relative',
          background: COLORS.PRIMARY_CONTAINER,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className="lg:flex"
      >
        {/* Background Image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}>
          <img 
            alt="Cafe Environment"
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=1200&fit=crop&q=80"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              mixBlendMode: 'overlay',
              opacity: 0.3,
              transform: 'scale(1.1)',
            }}
          />
        </div>

        {/* Animated Pattern Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          opacity: 0.2,
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 20,
          padding: SPACING.XXL,
          maxWidth: '480px',
          color: COLORS.ON_PRIMARY_CONTAINER,
        }}>
          <h1 style={{
            fontFamily: TYPOGRAPHY.FONT_HEADLINE,
            fontSize: '48px',
            fontWeight: 700,
            lineHeight: '56px',
            letterSpacing: '-0.02em',
            marginBottom: SPACING.MD,
          }}>
            Operational Intelligence starts here.
          </h1>
          <p style={{
            fontFamily: TYPOGRAPHY.FONT_BODY,
            fontSize: FONT_SIZES.BODY_LG,
            opacity: 0.9,
            marginBottom: SPACING.XL,
          }}>
            Empower your cafe with MenuMind's AI-driven management. Join thousands of managers streamlining their workflows with real-time analytics.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.MD }}>
            {/* Feature Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: SPACING.MD,
                background: COLORS.SURFACE,
                padding: SPACING.MD,
                borderRadius: RADIUS.XL,
                border: `1px solid ${COLORS.OUTLINE_VARIANT}`,
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: COLORS.PRIMARY,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Sparkles size={20} color={COLORS.ON_PRIMARY} />
              </div>
              <div>
                <p style={{
                  fontFamily: TYPOGRAPHY.FONT_HEADLINE,
                  fontSize: FONT_SIZES.HEADLINE_SM,
                  fontWeight: 600,
                  color: COLORS.ON_PRIMARY_FIXED,
                }}>
                  AI-Powered Optimization
                </p>
                <p style={{
                  fontFamily: TYPOGRAPHY.FONT_BODY,
                  fontSize: FONT_SIZES.BODY_SM,
                  opacity: 0.8,
                }}>
                  Automated inventory and staffing insights.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Right Interaction Side (Signup Form) */}
      <main style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.MD,
      }} className="lg:p-2xl"
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>
          {/* Header Section */}
          <motion.div
            variants={REVEAL_UP}
            initial="hidden"
            animate="visible"
            style={{ marginBottom: SPACING.XL, textAlign: 'center' }}
            className="lg:text-left"
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: SPACING.SM,
              marginBottom: SPACING.LG,
            }} className="lg:justify-start"
            >
              <div style={{
                background: COLORS.PRIMARY,
                padding: SPACING.SM,
                borderRadius: RADIUS.LG,
              }}>
                <UtensilsCrossed size={28} color={COLORS.ON_PRIMARY} />
              </div>
              <span style={{
                fontFamily: TYPOGRAPHY.FONT_HEADLINE,
                fontSize: FONT_SIZES.HEADLINE_MD,
                fontWeight: 800,
                color: COLORS.PRIMARY,
              }}>
                MenuMind
              </span>
            </div>

            <h2 style={{
              fontFamily: TYPOGRAPHY.FONT_HEADLINE,
              fontSize: FONT_SIZES.HEADLINE_LG,
              fontWeight: 700,
              color: COLORS.ON_SURFACE,
              marginBottom: SPACING.SM,
            }}>
              Create Account
            </h2>
            <p style={{
              fontFamily: TYPOGRAPHY.FONT_BODY,
              fontSize: FONT_SIZES.BODY_MD,
              color: COLORS.ON_SURFACE_VARIANT,
            }}>
              Step into the future of cafe management intelligence.
            </p>
          </motion.div>

          {/* Form Section */}
          <motion.form
            variants={REVEAL_UP}
            initial="hidden"
            animate="visible"
            onSubmit={onFormSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: SPACING.LG }}
          >
            {/* Full Name Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{
                fontFamily: TYPOGRAPHY.FONT_LABEL,
                fontSize: '12px',
                fontWeight: 600,
                color: COLORS.ON_SURFACE_VARIANT,
                paddingLeft: '4px',
              }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{
                  position: 'absolute',
                  left: SPACING.MD,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: COLORS.OUTLINE,
                }} />
                <input
                  type="text"
                  {...register('fullName')}
                  placeholder="John Doe"
                  style={{
                    width: '100%',
                    padding: `${SPACING.MD} ${SPACING.MD} ${SPACING.MD} 44px`,
                    background: COLORS.SURFACE_CONTAINER_LOWEST,
                    border: `1px solid ${errors.fullName ? COLORS.ERROR : COLORS.OUTLINE_VARIANT}`,
                    borderRadius: RADIUS.XL,
                    fontFamily: TYPOGRAPHY.FONT_BODY,
                    fontSize: FONT_SIZES.BODY_MD,
                    color: COLORS.ON_SURFACE,
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.PRIMARY;
                    e.target.style.boxShadow = `0 0 0 2px ${COLORS.PRIMARY}33`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.fullName ? COLORS.ERROR : COLORS.OUTLINE_VARIANT;
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {errors.fullName && (
                  <p style={{
                    fontFamily: TYPOGRAPHY.FONT_BODY,
                    fontSize: FONT_SIZES.BODY_SM,
                    color: COLORS.ERROR,
                    paddingLeft: '4px',
                  }}>
                    {errors.fullName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Cafe Name Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{
                fontFamily: TYPOGRAPHY.FONT_LABEL,
                fontSize: '12px',
                fontWeight: 600,
                color: COLORS.ON_SURFACE_VARIANT,
                paddingLeft: '4px',
              }}>
                Cafe Name
              </label>
              <div style={{ position: 'relative' }}>
                <Store size={20} style={{
                  position: 'absolute',
                  left: SPACING.MD,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: COLORS.OUTLINE,
                }} />
                <input
                  type="text"
                  {...register('cafeName')}
                  placeholder="Modern Brews Cafe"
                  style={{
                    width: '100%',
                    padding: `${SPACING.MD} ${SPACING.MD} ${SPACING.MD} 44px`,
                    background: COLORS.SURFACE_CONTAINER_LOWEST,
                    border: `1px solid ${errors.cafeName ? COLORS.ERROR : COLORS.OUTLINE_VARIANT}`,
                    borderRadius: RADIUS.XL,
                    fontFamily: TYPOGRAPHY.FONT_BODY,
                    fontSize: FONT_SIZES.BODY_MD,
                    color: COLORS.ON_SURFACE,
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.PRIMARY;
                    e.target.style.boxShadow = `0 0 0 2px ${COLORS.PRIMARY}33`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.cafeName ? COLORS.ERROR : COLORS.OUTLINE_VARIANT;
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {errors.cafeName && (
                  <p style={{
                    fontFamily: TYPOGRAPHY.FONT_BODY,
                    fontSize: FONT_SIZES.BODY_SM,
                    color: COLORS.ERROR,
                    paddingLeft: '4px',
                  }}>
                    {errors.cafeName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{
                fontFamily: TYPOGRAPHY.FONT_LABEL,
                fontSize: '12px',
                fontWeight: 600,
                color: COLORS.ON_SURFACE_VARIANT,
                paddingLeft: '4px',
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={{
                  position: 'absolute',
                  left: SPACING.MD,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: COLORS.OUTLINE,
                }} />
                <input
                  type="email"
                  {...register('email')}
                  placeholder="manager@cafename.com"
                  style={{
                    width: '100%',
                    padding: `${SPACING.MD} ${SPACING.MD} ${SPACING.MD} 44px`,
                    background: COLORS.SURFACE_CONTAINER_LOWEST,
                    border: `1px solid ${errors.email ? COLORS.ERROR : COLORS.OUTLINE_VARIANT}`,
                    borderRadius: RADIUS.XL,
                    fontFamily: TYPOGRAPHY.FONT_BODY,
                    fontSize: FONT_SIZES.BODY_MD,
                    color: COLORS.ON_SURFACE,
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.PRIMARY;
                    e.target.style.boxShadow = `0 0 0 2px ${COLORS.PRIMARY}33`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.email ? COLORS.ERROR : COLORS.OUTLINE_VARIANT;
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {errors.email && (
                  <p style={{
                    fontFamily: TYPOGRAPHY.FONT_BODY,
                    fontSize: FONT_SIZES.BODY_SM,
                    color: COLORS.ERROR,
                    paddingLeft: '4px',
                  }}>
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{
                fontFamily: TYPOGRAPHY.FONT_LABEL,
                fontSize: '12px',
                fontWeight: 600,
                color: COLORS.ON_SURFACE_VARIANT,
                paddingLeft: '4px',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{
                  position: 'absolute',
                  left: SPACING.MD,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: COLORS.OUTLINE,
                }} />
                <input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: `${SPACING.MD} ${SPACING.MD} ${SPACING.MD} 44px`,
                    background: COLORS.SURFACE_CONTAINER_LOWEST,
                    border: `1px solid ${errors.password ? COLORS.ERROR : COLORS.OUTLINE_VARIANT}`,
                    borderRadius: RADIUS.XL,
                    fontFamily: TYPOGRAPHY.FONT_BODY,
                    fontSize: FONT_SIZES.BODY_MD,
                    color: COLORS.ON_SURFACE,
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.PRIMARY;
                    e.target.style.boxShadow = `0 0 0 2px ${COLORS.PRIMARY}33`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.password ? COLORS.ERROR : COLORS.OUTLINE_VARIANT;
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {errors.password ? (
                  <p style={{
                    fontFamily: TYPOGRAPHY.FONT_BODY,
                    fontSize: FONT_SIZES.BODY_SM,
                    color: COLORS.ERROR,
                    marginTop: '4px',
                    paddingLeft: '4px',
                  }}>
                    {errors.password.message}
                  </p>
                ) : (
                  <p style={{
                    fontFamily: TYPOGRAPHY.FONT_BODY,
                    fontSize: FONT_SIZES.BODY_SM,
                    color: COLORS.OUTLINE,
                    marginTop: '4px',
                    paddingLeft: '4px',
                  }}>
                    Minimum 8 characters with at least one number.
                  </p>
                )}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: SPACING.MD,
              marginTop: SPACING.SM,
            }}>
              <input
                type="checkbox"
                {...register('agreedToTerms')}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: RADIUS.SM,
                  border: `1px solid ${errors.agreedToTerms ? COLORS.ERROR : COLORS.OUTLINE_VARIANT}`,
                  accentColor: COLORS.PRIMARY,
                  cursor: 'pointer',
                }}
              />
              <label style={{
                fontFamily: TYPOGRAPHY.FONT_BODY,
                fontSize: FONT_SIZES.BODY_SM,
                color: COLORS.ON_SURFACE_VARIANT,
              }}>
                I agree to the{' '}
                <Link href="#" style={{ color: COLORS.PRIMARY, fontWeight: 500, textDecoration: 'none' }}>
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="#" style={{ color: COLORS.PRIMARY, fontWeight: 500, textDecoration: 'none' }}>
                  Privacy Policy
                </Link>.
              </label>
            </div>

            {/* Create Account Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!agreedToTerms}
              style={{
                width: '100%',
                padding: `${SPACING.MD} ${SPACING.LG}`,
                background: agreedToTerms ? COLORS.PRIMARY : COLORS.SURFACE_CONTAINER_HIGH,
                color: agreedToTerms ? COLORS.ON_PRIMARY : COLORS.ON_SURFACE_VARIANT,
                border: 'none',
                borderRadius: RADIUS.XL,
                fontFamily: TYPOGRAPHY.FONT_HEADLINE,
                fontSize: FONT_SIZES.HEADLINE_SM,
                fontWeight: 600,
                boxShadow: agreedToTerms ? `0 10px 20px ${COLORS.PRIMARY}26` : 'none',
                cursor: agreedToTerms ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: SPACING.SM,
                transition: 'all 0.2s',
              }}
            >
              Create Account
              <ArrowRight size={20} />
            </motion.button>

            {/* Login Redirect */}
            <div style={{
              paddingTop: SPACING.LG,
              borderTop: `1px solid ${COLORS.OUTLINE_VARIANT}33`,
              textAlign: 'center',
            }}>
              <p style={{
                fontFamily: TYPOGRAPHY.FONT_BODY,
                fontSize: FONT_SIZES.BODY_MD,
                color: COLORS.ON_SURFACE_VARIANT,
              }}>
                Already have an account?{' '}
                <Link href="/login" style={{
                  color: COLORS.PRIMARY,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}>
                  Sign In
                </Link>
              </p>
            </div>
          </motion.form>

          {/* Footer Meta */}
          <footer style={{
            marginTop: SPACING.XXL,
            textAlign: 'center',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: SPACING.LG,
              color: COLORS.OUTLINE,
            }}>
              <span style={{
                fontFamily: TYPOGRAPHY.FONT_LABEL,
                fontSize: '12px',
              }}>
                © 2024 MenuMind Inc.
              </span>
              <div style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: COLORS.OUTLINE,
              }} />
              <span style={{
                fontFamily: TYPOGRAPHY.FONT_LABEL,
                fontSize: '12px',
              }}>
                Help Center
              </span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}