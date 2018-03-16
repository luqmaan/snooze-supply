import axios from "axios";
import { Component } from "react";
import Head from "next/head";

const race = (...promises) =>
  new Promise((res, rej) => {
    promises.forEach(p => p.then(res).catch(rej));
  });

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function PhoneHr() {
  return (
    <div className="centered">
      <div className="hr" />
      <div className="icon">
        <img src="/static/fax.svg" />
      </div>
      <div className="hr" />
      <style jsx>{`
        .centered {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 2rem 0;
        }
        .hr {
          border-top: 1px solid #fff;
          flex: 1;
        }
        .hr:first-child {
          margin-right: 1rem;
        }
        .hr:last-child {
          margin-left: 1rem;
        }
        .icon img {
          height: 30px;
        }
      `}</style>
    </div>
  );
}

function SignupSuccess({ email, twitter, phone }) {
  return (
    <div>
      <h2>Snooze season approachin’</h2>
      <p>Thanks for signing up:</p>
      <ul>
        <li>{email}</li>
        <li>{twitter}</li>
        <li>{phone}</li>
      </ul>
      <p>
        The first 15 people to follow and retweet{" "}
        <a href="https://twitter.com/snzsply" target="_blank">
          @snzsply
        </a>{" "}
        will get 1 month free and will be invited to the private alpha.
      </p>
    </div>
  );
}

class WaitlistForm extends Component {
  state = {
    email: "",
    twitter: "",
    phone: "",
    plan: null,
    loading: false,
    success: false
  };

  setStateAsync = newState =>
    new Promise(resolve => this.setState(newState, () => resolve()));

  joinWaitlist = async () => {
    await this.setStateAsync({ loading: true });
    const savePromise = axios.post("/waitlist", {
      email: this.state.email,
      phone: this.state.phone,
      plan: this.state.plan
    });
    await Promise.all([savePromise, delay(1000)]);
    await this.setStateAsync({ loading: false });
    await this.setState({
      success: true
    });
  };

  render() {
    if (this.state.success) {
      return <SignupSuccess {...this.state} />;
    }

    return (
      <div>
        <h2>Sign up for the snooze.supply waitlist</h2>
        <p>
          Sign up for snooze.supply and automatically get a phone call or text
          message whenever something good drops on{" "}
          <a href="https://yeezysupply.com/" target="_blank">
            yeezysupply.com
          </a>.
        </p>
        <p>
          The first 15 people to follow and retweet{" "}
          <a href="https://twitter.com/snzsply" target="_blank">
            @snzsply
          </a>, will get 1 month free and will be invited to the private alpha.
        </p>
        <div className="waitlist">
          <label>
            <div className="label">
              <b>Email</b>
            </div>
            <input
              placeholder="email"
              type="email"
              value={this.state.email}
              onChange={e => this.setState({ email: e.target.value })}
            />
          </label>
          <label>
            <div className="label">
              <b>Twitter</b>
            </div>
            <input
              placeholder="@snzsply"
              type="text"
              value={this.state.twitter}
              onChange={e => this.setState({ twitter: e.target.value })}
            />
          </label>
          <label>
            <div className="label">
              <b>Phone</b>
            </div>
            <input
              placeholder="phone"
              type="phone"
              value={this.state.phone}
              onChange={e => this.setState({ phone: e.target.value })}
            />
          </label>
          <label className="radio">
            <div className="label">
              <b>Phone Calls + Text Messages</b> $10/month
            </div>
            <input
              type="radio"
              value="sms"
              checked={this.state.plan === "sms"}
              onChange={e => this.setState({ plan: e.target.value })}
            />
          </label>
          <label className="radio">
            <div className="label">
              <b>Text Messages</b> $5/month
            </div>
            <input
              type="radio"
              value="phone"
              checked={this.state.plan === "phone"}
              onChange={e => this.setState({ plan: e.target.value })}
            />
          </label>
          <label className="radio">
            <div className="label">Too expensive, but I'm interested</div>
            <input
              type="radio"
              value="interested"
              checked={this.state.plan === "interested"}
              onChange={e => this.setState({ plan: e.target.value })}
            />
          </label>
          <button
            onClick={this.joinWaitlist}
            className={this.state.loading && "loading"}
          >
            <div className="icon">
              <img
                src={
                  this.state.loading
                    ? "/static/loading.svg"
                    : "/static/cursor.svg"
                }
              />
            </div>
            {!this.state.loading && "Join Waitlist"}
            {this.state.loading && "Saving..."}
          </button>
        </div>
        <style jsx>{`
          label {
            display: flex;
            flex-direction: column;
            margin: 1rem 0;
          }
          label.radio {
            flex-direction: row;
          }
          input:focus {
            box-shadow: 0 0 5px #83128f;
            border: 1px solid #83128f;
          }
          input {
            transition: all 100ms ease-in-out;
            outline: none;
            border: 1px solid #dddddd;
          }
          input[type="text"],
          input[type="email"],
          input[type="phone"] {
            padding: 0.5rem 1rem;
            font-size: 1.2rem;
            margin: 0.2rem 0;
          }
          input[type="radio"] {
            display: inline-block;
          }
          label.radio input {
            order: 1;
            margin-right: 1rem;
          }
          label.radio .label {
            order: 2;
          }
          button {
            background: #85128f;
            border: none;
            color: #fff;
            font-family: VT323, Courier New, Courier, Lucida Sans Typewriter,
              Lucida Typewriter, monospace;
            text-transform: uppercase;
            font-weight: normal;
            font-size: 1.8rem;
            padding: 0.5rem 0.5rem;
            display: flex;
            align-items: center;
            margin: 1rem 0;
            cursor: pointer;
            transition: all 100ms ease-in-out;
          }
          button:hover {
            background: #757575;
          }
          .icon {
            margin-right: 0.5rem;
            fill: #fff;
            height: 30px;
          }
          .icon img {
            height: 100%;
            width: auto;
          }
          .waitlist {
            padding: 0 1rem;
          }
        `}</style>
      </div>
    );
  }
}

export default () => (
  <div>
    <Head>
      <title>snooze.supply | phone call alerts for yeezy.supply</title>
      <link
        href="https://fonts.googleapis.com/css?family=PT+Sans|VT323"
        rel="stylesheet"
      />
      <link
        rel="apple-touch-icon"
        sizes="120x120"
        href="/static/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/static/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/static/favicon-16x16.png"
      />
      <link rel="manifest" href="/static/site.webmanifest" />
      <link
        rel="mask-icon"
        href="/static/safari-pinned-tab.svg"
        color="#0b0192"
      />
      <meta name="msapplication-TileColor" content="#0b0192" />
      <meta name="theme-color" content="#0b0192" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1"
      />
    </Head>
    <div className="app">
      <h1 className="logo">
        <div className="icon">
          <img src="/static/fax.svg" />
        </div>snooze.supply
      </h1>
      <h2>Get a phone call or text whenever yeezy.supply goes live</h2>
      <p>
        Yeezy Supply is Kanye West's official store. Every Yeezy sneaker
        releases there, often months before they release on Adidas.com. Yeezy
        Supply releases at random times, sometimes even in the middle of the
        night. Because of this, it's common to stay up all night refreshing
        YeezySupply.com every 10 seconds.
      </p>
      <p>
        Another approach is to turn on Twitter push notifications for{" "}
        <a href="https://twitter.com/theyeezymafia">@theyeezymafia</a>.
        Unfortunately, they don't just tweet when the Yeezys are live. They're
        constantly tweeting memes and trolling sneaker twitter. Which means your
        sleep is constantly interrupted.
      </p>
      <p>
        If only there was something that could disturb your sleep only when
        absolutely necessary.
      </p>
      <PhoneHr />
      <WaitlistForm />
      <PhoneHr />
      <h2>Features</h2>
      <ul>
        <li>
          Get a text message or phone call whenever something worthwhile
          releases.
        </li>
        <li>
          Get a text message or phone call when the password page goes up or
          down. You can turn off this feature if you don't care about the
          password page.
        </li>
        <li>
          Get a text message with a link to checkout with your preferred
          size(s). This saves you precious time when checking out. The link will
          look something like this:{" "}
          <a href="https://yeezysupply.com/cart/878756855827:1" target="_blank">
            yeezysupply.com/cart/878756855827:1
          </a>.
        </li>
        <li>
          Opt out of releases. Don't care about dad shoes like the Powerphase or
          Waverunner? Simply turn off notifications for them.
        </li>
      </ul>
      <h2>Questions</h2>
      <p>
        Have any questions? Contact me on Twitter at{" "}
        <a href="https://twitter.com/luqmonster" target="_blank">
          @luqmonster
        </a>.
      </p>
    </div>
    <style jsx>
      {`
        .app {
          max-width: 600px;
          margin: 0 auto;
        }
        li {
          margin-bottom: 1rem;
        }
        .logo {
          display: flex;
          align-items: center;
        }
        .logo .icon {
          margin-right: 1rem;
        }
        .logo .icon img {
          height: 40px;
        }
      `}
    </style>
    <style jsx global>{`
      html,
      body {
        color: #fff;
        font-family: Courier New, Courier, Lucida Sans Typewriter,
          Lucida Typewriter, monospace;
        background: #0c0192;
        font-size: 18px;
        line-height: 24px;
        margin: 0;
        padding: 0.5rem 1rem;
      }
      h1 {
        text-shadow: 1px 4px 3px #201175;
        color: #fff;
      }
      a {
        color: #ababab;
        text-decoration: none;
        color: #fff;
        background: #84128f;
        word-wrap: break-word;
        transition: all 100ms ease-in-out;
      }
      a:hover {
        background: #757575;
      }
      h1,
      h2,
      h3,
      input {
        font-family: VT323, Courier New, Courier, Lucida Sans Typewriter,
          Lucida Typewriter, monospace;
        text-transform: uppercase;
        font-weight: normal;
      }
    `}</style>
    {process.env.NODE_ENV === "production" && (
      <script
        dangerouslySetInnerHTML={{
          __html: `
          window['_fs_debug'] = false;
          window['_fs_host'] = 'fullstory.com';
          window['_fs_org'] = 'B3ETJ';
          window['_fs_namespace'] = 'FS';
          (function(m,n,e,t,l,o,g,y){
              if (e in m) {if(m.console && m.console.log) { m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].');} return;}
              g=m[e]=function(a,b){g.q?g.q.push([a,b]):g._api(a,b);};g.q=[];
              o=n.createElement(t);o.async=1;o.src='https://'+_fs_host+'/s/fs.js';
              y=n.getElementsByTagName(t)[0];y.parentNode.insertBefore(o,y);
              g.identify=function(i,v){g(l,{uid:i});if(v)g(l,v)};g.setUserVars=function(v){g(l,v)};
              y="rec";g.shutdown=function(i,v){g(y,!1)};g.restart=function(i,v){g(y,!0)};
              g.identifyAccount=function(i,v){o='account';v=v||{};v.acctId=i;g(o,v)};
              g.clearUserCookie=function(){};
          })(window,document,window['_fs_namespace'],'script','user');
          `
        }}
      />
    )}
    {process.env.NODE_ENV === "production" && (
      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=UA-115921887-1"
      />
    )}
    {process.env.NODE_ENV === "production" && (
      <script
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'UA-115921887-1');
        `
        }}
      />
    )}
  </div>
);
