import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail } from 'lucide-react';
import { CONFIG } from '../constants';
import { apiService } from '../services/api';
import { User } from '../types';
import { Icons } from './Icons';

interface LoginOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user?: User) => void;
}

type LoginMode = 'oneClick' | 'sms';

const phonePattern = /^1\d{10}$/;

const LoginOverlay: React.FC<LoginOverlayProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<LoginMode>('oneClick');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setMode('sms');
    setPhoneNumber('');
    setCode('');
    setAgreed(false);
    setErrorMessage('');

    const timer = window.setTimeout(() => {
      setMode('oneClick');
    }, 260);

    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = window.setTimeout(() => {
      setCountdown(value => Math.max(value - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  const assertAgreement = () => {
    if (agreed) return true;
    setErrorMessage('请先阅读并同意相关协议');
    return false;
  };

  const handleOneClickLogin = async () => {
    if (!assertAgreement()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await apiService.login(CONFIG.ONE_CLICK_PHONE_NUMBER);
      onLoginSuccess(user);
      onClose();
    } catch (error) {
      console.error('One-click login failed', error);
      setErrorMessage(error instanceof Error ? error.message : '登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!phonePattern.test(phoneNumber)) {
      setErrorMessage('请输入正确的 11 位手机号');
      return;
    }

    if (!assertAgreement()) return;

    setIsSendingCode(true);
    setErrorMessage('');

    try {
      await apiService.sendLoginCode(phoneNumber);
      setCountdown(60);
    } catch (error) {
      console.error('Send login code failed', error);
      setErrorMessage(error instanceof Error ? error.message : '验证码发送失败，请稍后重试');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSmsLogin = async () => {
    if (!phonePattern.test(phoneNumber)) {
      setErrorMessage('请输入正确的 11 位手机号');
      return;
    }

    if (!code.trim()) {
      setErrorMessage('请输入验证码');
      return;
    }

    if (!assertAgreement()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await apiService.loginWithCode(phoneNumber, code.trim());
      onLoginSuccess(user);
      onClose();
    } catch (error) {
      console.error('SMS login failed', error);
      setErrorMessage(error instanceof Error ? error.message : '登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseButton = () => {
    if (mode === 'oneClick') {
      setMode('sms');
      setErrorMessage('');
      return;
    }

    onClose();
  };

  const AgreementToggle = ({ className = '' }: { className?: string }) => (
    <button
      type="button"
      aria-label={agreed ? '取消同意协议' : '同意协议'}
      onClick={() => {
        setAgreed(value => !value);
        setErrorMessage('');
      }}
      className={`mt-[3px] flex h-[15px] w-[15px] flex-shrink-0 items-center justify-center rounded-full border-[1.6px] transition-colors ${
        agreed ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-300 bg-white text-transparent'
      } ${className}`}
    >
      <Icons.Check size={10} strokeWidth={3} />
    </button>
  );

  const FooterActions = () => (
    <div className="mt-auto flex items-center justify-center gap-[34px] pb-[24px] pt-8 text-[17px] text-[#6d6d6d]">
      <button className="rounded-full bg-[#f4f6fb] px-[18px] py-[7px] font-medium text-black active:scale-95">
        密码登录
      </button>
      <button className="flex items-center gap-[17px] active:scale-95">
        <Mail size={29} fill="currentColor" strokeWidth={1.5} />
        <span>非大陆用户登录</span>
      </button>
    </div>
  );

  const renderOneClickLogin = () => (
    <motion.div
      key="oneClick"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.18 }}
      className="flex min-h-[533px] flex-col px-[22px] pt-[53px]"
    >
      <div className="pt-[27px] text-center text-[34px] font-black tracking-normal text-black">
        {CONFIG.ONE_CLICK_MASKED_PHONE}
      </div>

      <div className="mt-[88px] flex items-start gap-[10px] text-[17px] leading-[30px] text-[#9a9a9a]">
        <AgreementToggle />
        <p className="flex-1">
          我已阅读并同意
          <button className="text-[#2f8cff]">中国移动认证服务条款</button>
          和
          <button className="text-[#2f8cff]">用户协议</button>
          、
          <button className="text-[#2f8cff]">隐私政策</button>
        </p>
      </div>

      {errorMessage && <p className="mt-3 text-center text-sm text-red-500">{errorMessage}</p>}

      <button
        onClick={handleOneClickLogin}
        disabled={isLoading}
        className="mt-[35px] flex h-[58px] w-full items-center justify-center rounded-[8px] bg-gradient-to-r from-[#ff8337] to-[#f04b25] text-[22px] font-semibold text-white active:scale-[0.99] disabled:opacity-70"
      >
        {isLoading && <Icons.Loader className="mr-2 animate-spin" size={20} />}
        {isLoading ? '登录中...' : '本机号码一键登录'}
      </button>

      <button
        onClick={() => {
          setMode('sms');
          setErrorMessage('');
        }}
        className="mt-[38px] text-center text-[22px] font-medium text-[#2f8cff] active:scale-95"
      >
        其他手机号登录
      </button>

      <FooterActions />
    </motion.div>
  );

  const renderSmsLogin = () => (
    <motion.div
      key="sms"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.18 }}
      className="flex min-h-[533px] flex-col px-[49px] pt-[53px]"
    >
      <div className="flex items-center border-b border-[#ececec] pb-[18px]">
        <button className="flex items-center gap-[12px] pr-[28px] text-[22px] font-medium text-black">
          +86
          <Icons.ChevronDown size={20} fill="currentColor" strokeWidth={0} className="text-[#9b9b9b]" />
        </button>
        <input
          value={phoneNumber}
          onChange={event => {
            setPhoneNumber(event.target.value.replace(/\D/g, '').slice(0, 11));
            setErrorMessage('');
          }}
          inputMode="numeric"
          placeholder="请输入手机号"
          className="min-w-0 flex-1 bg-transparent text-[22px] text-black outline-none placeholder:text-[#c8c8cf]"
        />
      </div>

      <div className="mt-[25px] flex h-[50px] items-center gap-[10px] bg-[#f7f7f8] px-[18px] text-[17px] text-[#686868]">
        <AgreementToggle />
        <p className="flex-1 whitespace-nowrap">
          已阅读并同意
          <button className="text-[#2f8cff]"> 用户协议 </button>
          和
          <button className="text-[#2f8cff]"> 隐私政策</button>
        </p>
      </div>

      <div className="mt-[28px] flex items-center border-b border-[#ececec] pb-[18px]">
        <input
          value={code}
          onChange={event => {
            setCode(event.target.value.replace(/\D/g, '').slice(0, 6));
            setErrorMessage('');
          }}
          inputMode="numeric"
          placeholder="请输入验证码"
          className="min-w-0 flex-1 bg-transparent text-[22px] text-black outline-none placeholder:text-[#c8c8cf]"
        />
        <button
          onClick={handleSendCode}
          disabled={isSendingCode || countdown > 0}
          className="ml-4 text-[22px] font-medium text-[#d93636] disabled:text-gray-400"
        >
          {isSendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
        </button>
      </div>

      {errorMessage && <p className="mt-3 text-sm text-red-500">{errorMessage}</p>}

      <button
        onClick={handleSmsLogin}
        disabled={isLoading}
        className="mt-[26px] flex h-[63px] w-full items-center justify-center rounded-[11px] bg-gradient-to-r from-[#ff8337] to-[#f04b25] text-[25px] font-semibold text-white active:scale-[0.99] disabled:opacity-70"
      >
        {isLoading && <Icons.Loader className="mr-2 animate-spin" size={20} />}
        {isLoading ? '登录中...' : '登录'}
      </button>

      <FooterActions />
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
            className="fixed bottom-0 left-0 right-0 z-[101] mx-auto w-full max-w-md overflow-hidden rounded-t-[10px] bg-white shadow-2xl"
          >
            <div className="relative">
              <h2 className="pt-[39px] text-center text-[24px] font-medium text-black">登录账号</h2>
              <button
                aria-label="关闭登录弹层"
                onClick={handleCloseButton}
                className="absolute right-[31px] top-[37px] text-[#2f2f2f] active:scale-95"
              >
                <Icons.X size={33} strokeWidth={2.2} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {mode === 'oneClick' ? renderOneClickLogin() : renderSmsLogin()}
            </AnimatePresence>

            <div className="mx-auto mb-3 h-1.5 w-[138px] rounded-full bg-black" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginOverlay;
