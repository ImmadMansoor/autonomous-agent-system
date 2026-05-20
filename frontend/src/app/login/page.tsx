'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Brain, Shield, CheckCircle } from 'lucide-react';
import { SPACING, COLORS, RADIUS, TYPOGRAPHY, FONT_SIZES, SHADOWS } from '@/lib/constants';
import { REVEAL_UP } from '@/lib/animations';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/layout';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

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

  const onFormSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    handleSubmit(async (data) => {
      setIsSubmitting(true);
      try {
        await login(data.email, data.password);
        showToast('success', 'Welcome back', 'Successfully logged in');
        router.push('/');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        showToast('error', 'Login failed', message);
      } finally {
        setIsSubmitting(false);
      }
    })(e);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f7f9fb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.MD,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'fixed',
        top: '-10%',
        right: '-5%',
        width: '40%',
        height: '40%',
        background: `${COLORS.PRIMARY}0D`,
        borderRadius: '50%',
        filter: 'blur(120px)',
        zIndex: -10,
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-10%',
        left: '-5%',
        width: '30%',
        height: '30%',
        background: `${COLORS.TERTIARY}0D`,
        borderRadius: '100px',
        filter: 'blur(100px)',
        zIndex: -10,
      }} />

      <main style={{
        width: '100%',
        maxWidth: '1200px',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: SPACING.LG,
        alignItems: 'center',
      }}>
        <motion.section
          variants={REVEAL_UP}
          initial="hidden"
          animate="visible"
          style={{
            display: 'none',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: SPACING.XL,
            padding: SPACING.XL,
          }}
          className="lg:flex"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.MD }}>
            <div style={{
              width: '96px',
              height: '96px',
              marginBottom: SPACING.LG,
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: COLORS.PRIMARY,
                borderRadius: RADIUS.XL,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  fontFamily: TYPOGRAPHY.FONT_HEADLINE,
                  fontSize: '36px',
                  fontWeight: 800,
                  color: COLORS.ON_PRIMARY,
                }}>
                  M
                </span>
              </div>
            </div>

            <h1 style={{
              fontFamily: TYPOGRAPHY.FONT_HEADLINE,
              fontSize: '48px',
              fontWeight: 700,
              lineHeight: '56px',
              letterSpacing: '-0.02em',
              color: COLORS.PRIMARY,
            }}>
              Operational <br />
              <span style={{ color: COLORS.ON_SURFACE }}>Intelligence.</span>
            </h1>

            <p style={{
              fontFamily: TYPOGRAPHY.FONT_BODY,
              fontSize: FONT_SIZES.BODY_LG,
              color: COLORS.ON_SURFACE_VARIANT,
              maxWidth: '420px',
            }}>
              Seamlessly manage your cafe operations with AI-driven insights, real-time metrics, and automated inventory logistics.
            </p>
          </div>

          <motion.div
            variants={REVEAL_UP}
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${COLORS.TERTIARY}33`,
              borderRadius: RADIUS.XL,
              padding: SPACING.LG,
              boxShadow: SHADOWS.CARD,
              maxWidth: '380px',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: SPACING.SM,
              marginBottom: SPACING.SM,
              color: COLORS.TERTIARY,
            }}>
              <Brain size={20} />
              <span style={{
                fontFamily: TYPOGRAPHY.FONT_LABEL,
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                AI Insight
              </span>
            </div>
            <p style={{
              fontFamily: TYPOGRAPHY.FONT_BODY,
              fontSize: FONT_SIZES.BODY_SM,
              color: COLORS.ON_SURFACE,
            }}>
              "Peak hours detected for tomorrow. Intelligence suggests increasing staffing levels in the pastry section by 15%."
            </p>
          </motion.div>
        </motion.section>

        <motion.section
          variants={REVEAL_UP}
          initial="hidden"
          animate="visible"
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <div style={{
            width: '100%',
            maxWidth: '440px',
            background: COLORS.SURFACE_CONTAINER_LOWEST,
            border: `1px solid ${COLORS.OUTLINE_VARIANT}`,
            borderRadius: RADIUS.XL,
            padding: SPACING.XL,
            boxShadow: SHADOWS.CARD,
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: SPACING.XL,
            }} className="lg:hidden">
              <div style={{
                width: '64px',
                height: '64px',
                background: COLORS.PRIMARY,
                borderRadius: RADIUS.LG,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  fontFamily: TYPOGRAPHY.FONT_HEADLINE,
                  fontSize: '28px',
                  fontWeight: 800,
                  color: COLORS.ON_PRIMARY,
                }}>
                  M
                </span>
              </div>
            </div>

            <div style={{ marginBottom: SPACING.XL, textAlign: 'center' }} className="lg:text-left">
              <h2 style={{
                fontFamily: TYPOGRAPHY.FONT_HEADLINE,
                fontSize: FONT_SIZES.HEADLINE_MD,
                fontWeight: 600,
                color: COLORS.ON_SURFACE,
                marginBottom: SPACING.XS,
              }}>
                Welcome Back
              </h2>
              <p style={{
                fontFamily: TYPOGRAPHY.FONT_BODY,
                fontSize: FONT_SIZES.BODY_SM,
                color: COLORS.ON_SURFACE_VARIANT,
              }}>
                Access your operational dashboard
              </p>
            </div>

            <form onSubmit={onFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: SPACING.LG }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{
                  fontFamily: TYPOGRAPHY.FONT_LABEL,
                  fontSize: '12px',
                  fontWeight: 600,
                  color: COLORS.ON_SURFACE_VARIANT,
                }}>
                  Email Address
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={20} style={{
                    position: 'absolute',
                    left: SPACING.MD,
                    color: errors.email ? COLORS.ERROR : COLORS.OUTLINE,
                  }} />
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="manager@menumind.com"
                    style={{
                      width: '100%',
                      padding: `${SPACING.SM} ${SPACING.MD}`,
                      paddingLeft: '44px',
                      background: COLORS.SURFACE_CONTAINER_LOW,
                      border: `1px solid ${errors.email ? COLORS.ERROR : COLORS.OUTLINE_VARIANT}`,
                      borderRadius: RADIUS.LG,
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
                </div>
                {errors.email && (
                  <span style={{
                    fontFamily: TYPOGRAPHY.FONT_BODY,
                    fontSize: FONT_SIZES.BODY_SM,
                    color: COLORS.ERROR,
                    paddingLeft: '4px',
                  }}>
                    {errors.email.message}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{
                    fontFamily: TYPOGRAPHY.FONT_LABEL,
                    fontSize: '12px',
                    fontWeight: 600,
                    color: COLORS.ON_SURFACE_VARIANT,
                  }}>
                    Password
                  </label>
                  <Link href="#" style={{
                    fontFamily: TYPOGRAPHY.FONT_LABEL,
                    fontSize: '12px',
                    color: COLORS.PRIMARY,
                    textDecoration: 'none',
                  }}>
                    Forgot Password?
                  </Link>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={20} style={{
                    position: 'absolute',
                    left: SPACING.MD,
                    color: errors.password ? COLORS.ERROR : COLORS.OUTLINE,
                  }} />
                  <input
                    type="password"
                    {...register('password')}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: `${SPACING.SM} ${SPACING.MD}`,
                      paddingLeft: '44px',
                      background: COLORS.SURFACE_CONTAINER_LOW,
                      border: `1px solid ${errors.password ? COLORS.ERROR : COLORS.OUTLINE_VARIANT}`,
                      borderRadius: RADIUS.LG,
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
                </div>
                {errors.password && (
                  <span style={{
                    fontFamily: TYPOGRAPHY.FONT_BODY,
                    fontSize: FONT_SIZES.BODY_SM,
                    color: COLORS.ERROR,
                    paddingLeft: '4px',
                  }}>
                    {errors.password.message}
                  </span>
                )}
              </div>

              <div style={{ paddingTop: SPACING.SM, display: 'flex', flexDirection: 'column', gap: SPACING.MD }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: `${SPACING.MD} 0`,
                    background: isSubmitting ? COLORS.OUTLINE : COLORS.PRIMARY,
                    color: COLORS.ON_PRIMARY,
                    border: 'none',
                    borderRadius: RADIUS.LG,
                    fontFamily: TYPOGRAPHY.FONT_LABEL,
                    fontSize: '12px',
                    fontWeight: 600,
                    boxShadow: SHADOWS.CARD,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </motion.button>

                <div style={{
                  background: 'rgba(74, 222, 128, 0.08)',
                  border: '1px dashed rgba(74, 222, 128, 0.3)',
                  borderRadius: RADIUS.LG,
                  padding: SPACING.SM,
                  textAlign: 'center',
                  fontSize: '12px',
                  color: COLORS.ON_SURFACE,
                  fontFamily: TYPOGRAPHY.FONT_BODY,
                  marginTop: SPACING.XS,
                }}>
                  💡 <strong>Demo Mode:</strong> Use <strong style={{ color: COLORS.PRIMARY }}>demo@menumind.ai</strong> with password <strong>demo</strong>
                </div>

                <div style={{ position: 'relative', padding: `${SPACING.SM} 0`, textAlign: 'center' }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    borderTop: `1px solid ${COLORS.OUTLINE_VARIANT}`,
                  }} />
                  <div style={{
                    position: 'relative',
                    display: 'inline-block',
                    padding: `0 ${SPACING.MD}`,
                    background: COLORS.SURFACE_CONTAINER_LOWEST,
                    color: COLORS.OUTLINE,
                    fontFamily: TYPOGRAPHY.FONT_LABEL,
                    fontSize: '10px',
                    textTransform: 'uppercase',
                  }}>
                    Secure Gateway
                  </div>
                </div>

                <p style={{
                  textAlign: 'center',
                  fontFamily: TYPOGRAPHY.FONT_BODY,
                  fontSize: FONT_SIZES.BODY_SM,
                  color: COLORS.ON_SURFACE_VARIANT,
                }}>
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" style={{
                    color: COLORS.PRIMARY,
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}>
                    Sign up
                  </Link>
                </p>
              </div>
            </form>

            <div style={{
              marginTop: SPACING.XL,
              paddingTop: SPACING.LG,
              borderTop: `1px solid ${COLORS.OUTLINE_VARIANT}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.XS }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: COLORS.PRIMARY,
                }} />
                <span style={{
                  fontFamily: TYPOGRAPHY.FONT_LABEL,
                  fontSize: '10px',
                  color: COLORS.ON_SURFACE_VARIANT,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}>
                  System Online
                </span>
              </div>
              <div style={{ display: 'flex', gap: SPACING.SM }}>
                <Shield size={16} style={{ color: COLORS.OUTLINE }} />
                <CheckCircle size={16} style={{ color: COLORS.OUTLINE }} />
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}