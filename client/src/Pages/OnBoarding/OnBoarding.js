import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import stylesOnBoarding from './stylesOnBoarding';
import { Paper, Divider } from '@material-ui/core';
import ProgressBar from '../../Components/ProgressBar/ProgressBar';
import ProfileSetup from '../../Components/OnBoarding/ProfileSetup';
import ConnectedPage from '../../Components/OnBoarding/ConnectedPage';
import AvailabilitySetup from '../../Components/OnBoarding/AvailabilitySetup';
import handleFetchErrors from '../../utils/handleFetchErrors';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import auth from '../../auth';

const text = {
  profile: {
    header: 'Welcome to CalendApp!',
    btnText: 'Continue',
  },
  confirm: {
    header: 'Your Google Calendar is connected!',
    btnText: 'Continue',
  },
  availability: {
    header: 'Set your availability',
    btnText: 'Finish',
  },
};

function OnBoarding({ classes, type, activeStep }) {
  const [urlField, setUrl] = useState({ url: '', error: false, errorText: '' });
  const [timeZone, setTimeZone] = useState(moment.tz.guess());
  const [hoursField, setHours] = useState({ start: '09:00', end: '17:00', error: false, errorText: '' });
  const [days, setDays] = useState({
    Sunday: false,
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: false,
  });

  let history = useHistory();

  function getStepContent(type) {
    if (type === 'profile') {
      return (
        <ProfileSetup
          handleProfileSubmit={handleProfileSubmit}
          btnText={text[type].btnText}
          url={urlField.url}
          urlError={urlField.error}
          urlErrorText={urlField.errorText}
          handleUrl={handleUrl}
          timeZone={timeZone}
          setUrl={setUrl}
          setTimeZone={setTimeZone}
        />
      );
    }
    if (type === 'confirm') {
      const email = auth.getEmail();
      return <ConnectedPage btnText={text[type].btnText} handleConfirmSubmit={handleConfirmSubmit} email={email} />;
    }
    if (type === 'availability') {
      return (
        <AvailabilitySetup
          btnText={text[type].btnText}
          submitForm={submitForm}
          hoursField={hoursField}
          setHours={setHours}
          setDays={setDays}
          days={days}
        />
      );
    }
  }

  const handleUrl = (e) => {
    if (!e || !e.target.value) {
      setUrl({ url: '', error: true, errorText: 'Url is required' });
      return;
    } else {
      setUrl({ url: e.target.value, error: false, errorText: '' });
    }
    const url = e.target.value;
    fetch(`/api/user/uniqueUrl?url=${url}`)
      .then(handleFetchErrors)
      .then((res) => res.json())
      .then((data) => {
        if (!data.isUnique) {
          setUrl({ url: url, error: true, errorText: 'Url is not unique' });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleConfirmSubmit = () => {
    history.push('/availability');
  };

  const handleProfileSubmit = () => {
    //prevents going to next form until url is unique & timezone + url is not empty
    //TODO: needs error handling. No message displayed for errors
    // if (url === '' || timeZone === '') {
    //   return;
    // }
    //
    // fetch(`/api/user/uniqueUrl?url=${url}`)
    //   .then(handleFetchErrors)
    //   .then((res) => res.json())
    //   .then((data) => {
    //     if (!data.isUnique) {
    //       return;
    //     }
    //     history.push('/confirm');
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //   });
  };

  const submitForm = () => {
    const profileInfo = {
      urlField,
      timeZone,
      hoursField,
      days,
    };
    const sub = auth.getSub();

    fetch(`/api/user/profile/${sub}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileInfo),
    })
      .then(handleFetchErrors)
      .then((res) => {
        if (res.status !== 200) return;
        history.push('/dashboard');
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <Paper elevation={6} className={classes.paper}>
      <div className={classes.headRow}>
        <div className={classes.headContent}>
          <h2>{text[type].header}</h2>
          <ProgressBar activeStep={activeStep} />
        </div>
        <Divider className={classes.divider} />
      </div>
      {getStepContent(type)}
    </Paper>
  );
}

OnBoarding.propTypes = {
  classes: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  activeStep: PropTypes.number.isRequired,
};

export default withStyles(stylesOnBoarding)(OnBoarding);
