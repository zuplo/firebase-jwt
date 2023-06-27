/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";
import {
  UserCredential,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { FirebaseApp, initializeApp } from "firebase/app";
import { SpinnerCircular } from "spinners-react";

const inter = Inter({ subsets: ["latin"] });

interface Form {
  apiKey?: string;
  email?: string;
  password?: string;
}

interface UserCredentialAndToken {
  userCredential: UserCredential;
  token: string;
}

interface Response {
  title: string;
  message: string;
}

export default function Home() {
  const [app, setApp] = useState<FirebaseApp | undefined>(undefined);
  const [userCredential, setUserCredential] = useState<
    UserCredentialAndToken | undefined
  >(undefined);
  const [form, setForm] = useState<Form>({});
  const [busy, setBusy] = useState<string | undefined>(undefined);
  const [response, setResponse] = useState<Response | undefined>(undefined);

  // load data from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem("jwt-generator-apiKey");
    if (savedApiKey) {
      setForm((form) => ({ ...form, apiKey: savedApiKey }));
    }
  }, []);

  useEffect(() => {
    if (!form.apiKey) {
      return;
    }

    console.log(`Initializing Firebase with '${form.apiKey}'`);

    const firebaseConfig = {
      apiKey: form.apiKey,
    };
    const app = initializeApp(firebaseConfig, Math.random().toString());
    setApp(app);
  }, [form.apiKey]);

  const login = useCallback(async () => {
    if (!app || !form.email || !form.password) {
      setResponse({
        title: "Required fields missing",
        message: "Web API Key, e-mail and password are required",
      });
      return;
    }
    try {
      setResponse(undefined);
      setBusy("login");
      const auth = getAuth(app);
      const uc = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      setBusy(undefined);
      const token = await uc.user.getIdToken();
      setUserCredential({ userCredential: uc, token });
    } catch (err: any) {
      setBusy(undefined);
      setResponse({
        title: "Login failed",
        message: err.message,
      });
    }
  }, [app, form]);

  const signup = useCallback(async () => {
    if (!app || !form.email || !form.password) {
      setResponse({
        title: "Required fields missing",
        message: "Web API Key, e-mail and password are required",
      });
      return;
    }
    try {
      setResponse(undefined);
      setBusy("signup");
      const auth = getAuth(app);
      const uc = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      setBusy(undefined);
      setResponse({
        title: "User created",
        message: `User ID: '${uc.user.uid}' and e-mail '${form.email}' created.`,
      });
      const token = await uc.user.getIdToken();
      setUserCredential({ userCredential: uc, token });
    } catch (err: any) {
      setBusy(undefined);
      setResponse({
        title: "Login failed",
        message: err.message,
      });
    }
  }, [app, form.email, form.password]);

  const updateField = (field: string, value: string) => {
    setForm((form) => ({ ...form, [field]: value }));
    if (field === "apiKey") {
      localStorage.setItem("jwt-generator-apiKey", value);
    }
  };

  return (
    <>
      <Head>
        <title>JWT Generator for Firebase</title>
      </Head>
      <div className="m-10 max-w-lg flex flex-col space-y-6">
        <h1 className="text-3xl font-bold flex flex-row items-center">
          <img src="/firebase.png" className="h-12" alt="firebase logo" />
          JWT Generator for Firebase
        </h1>
        <h2 className="text-xl text-orange-500">
          <em>&ldquo;because sometimes you just want a JWT token</em>&rdquo;
        </h2>
        <div className="text-sm">
          <div className="flex flex-row items-start rounded-t bg-gray-300 p-3">
            <ExclamationTriangleIcon className="w-4 h-auto flex-none mt-0.5 mr-1 text-orange-500" />
            This is a fully client-side application designed to help you quickly
            get a JWT token for Firebase. No data is sent to our servers. Your
            passwords, keys and JWT tokens are not recorded by us. Your public
            URL and KEY are stored in localStorage on your machine.
          </div>
          <div className="rounded-b bg-gray-200 p-4">
            <div className="text-gray-600 text-xs pb-2">INSTRUCTIONS</div>
            <ol>
              <li>1. Enter your Fireabase project Web API Key.</li>
              <li>2. Create an account and login 👏</li>
            </ol>
          </div>
        </div>

        {busy && (
          <div className="rounded bg-yellow-200 p-4 text-orange-500">
            <SpinnerCircular color="orange" secondaryColor="gray" />
          </div>
        )}
        {response && (
          <div className="rounded bg-orange-200 p-4 text-orange-800">
            <div className="font-bold">{response.title}</div>
            <div className="">{response.message}</div>
          </div>
        )}

        {!userCredential && (
          <>
            <div>
              <div className="font-bold">
                Web API Key{" "}
                <span className="text-xs text-gray-500 font-light">
                  get from Project Settings &gt; General
                </span>
              </div>
              <input
                type="text"
                className="rounded border-gray-500 border w-full font-mono p-1 text-sm"
                value={form.apiKey}
                onChange={(evt) => updateField("apiKey", evt.target.value)}
              />
            </div>
            <div>
              <div className="font-bold">E-mail</div>
              <input
                type="text"
                className="rounded border-gray-500 border w-full font-mono p-1 text-sm"
                value={form.email}
                onChange={(evt) => updateField("email", evt.target.value)}
              />
            </div>
            <div>
              <div className="font-bold">Password</div>
              <input
                type="text"
                className="rounded border-gray-500 border w-full font-mono p-1 text-sm"
                value={form.password}
                onChange={(evt) => updateField("password", evt.target.value)}
              />
            </div>
            <div className="flex flex-row gap-x-2">
              <button
                disabled={busy !== undefined}
                onClick={login}
                className="bg-orange-500 rounded p-1 w-20 text-white font-bold "
              >
                Login
              </button>
              <button
                disabled={busy !== undefined}
                onClick={signup}
                className="bg-white border-orange-500 border rounded p-1 w-20 text-orange-500 font-bold "
              >
                Sign up
              </button>
            </div>
          </>
        )}
        {userCredential && (
          <>
            <span className="text-gray-700 text-xs">Your JWT token is:</span>
            <div className="bg-gray-200 rounded p-4">
              <div
                className="text-md font-mono break-all"
                onDoubleClick={(evt) => {
                  window.getSelection()?.selectAllChildren(evt.target as any);
                }}
              >
                {userCredential.token}
              </div>
            </div>
            <div>
              <button
                className="text-orange-600 hover:underline items-center flex flex-row gap-x-1 rounded border border-transparent hover:border-orange-500 px-3 py-1"
                onClick={() => setUserCredential(undefined)}
              >
                <ArrowPathIcon className="h-4 w-4" />
                Refresh and sign-in again
              </button>
            </div>
          </>
        )}

        <div className="text-xs text-gray-600 border-t">
          Provided by the folks at{" "}
          <a
            href="https://zuplo.com/"
            className="text-pink-500 hover:underline"
          >
            zuplo
          </a>{" "}
          - a free, serverless API gateway. Get the{" "}
          <a
            href="https://github.com/zuplo/firebase-jwt"
            className="text-pink-500 hover:underline"
          >
            source and contribute on GitHub
          </a>
          . Need help?{" "}
          <a
            href="https://discord.gg/8QbEjr2MgZ"
            className="text-pink-500 hover:underline"
          >
            Join our Discord Server
          </a>
          .
        </div>
      </div>
    </>
  );
}
