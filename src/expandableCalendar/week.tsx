import XDate from 'xdate';
import React, {useRef, useMemo, useCallback} from 'react';
import {View} from 'react-native';

import {getPartialWeekDates, getWeekDates, sameMonth} from '../dateutils';
import {parseDate, toMarkingFormat} from '../interface';
import {getState} from '../day-state-manager';
import {extractDayProps} from '../componentUpdater';
import styleConstructor from './style';
import {CalendarProps} from '../calendar';
import Day from '../calendar/day/index';
import {CalendarContextProps} from './Context';
import {isEmpty, isEqual} from 'lodash';


export type WeekProps = CalendarProps & {
  context?: CalendarContextProps;
};

const propsAreEqual = (prevProps: WeekProps, nextProps: WeekProps) => {
  if (isEmpty(nextProps.context)) {
    return true;
  }
  const prevPropsToCheck = {
    ...prevProps.markedDates,
    ...prevProps.context,
  };

  const nextPropsToCheck = {
    ...nextProps.markedDates,
    ...nextProps.context,
  };

  return isEmpty(nextProps.context) || isEqual(prevPropsToCheck, nextPropsToCheck);
};

const Week = React.memo((props: WeekProps) => {
  const {theme, current, firstDay, hideExtraDays, markedDates, onDayPress, onDayLongPress, style: propsStyle, numberOfDays = 1, timelineLeftInset} = props;
  const style = useRef(styleConstructor(theme));
  const getWeek = useCallback((date?: string) => {
    if (date) {
      return getWeekDates(date, firstDay);
    }
  }, [firstDay]);

  const partialWeekStyle = useMemo(() => {
    return [style.current.partialWeek, {paddingLeft: timelineLeftInset}];
  }, [timelineLeftInset]);

  const dayProps = extractDayProps(props);
  const currXdate = useMemo(() => parseDate(current), [current]);

  const renderDay = (day: XDate, id: number) => {
    // hide extra days
    if (current && hideExtraDays) {
      if (!sameMonth(day, currXdate)) {
        return <View key={id} style={style.current.emptyDayContainer}/>;
      }
    }

    return (
      <View style={style.current.dayContainer} key={id}>
        <Day
          {...dayProps}
          date={toMarkingFormat(day)}
          state={getState(day, currXdate, props)}
          marking={markedDates?.[toMarkingFormat(day)]}
          onPress={onDayPress}
          onLongPress={onDayLongPress}
        />
      </View>
    );
  };

  const renderWeek = () => {
    const dates = numberOfDays > 1 ? getPartialWeekDates(current, numberOfDays) : getWeek(current);
    const week: JSX.Element[] = [];

    if (dates) {
      const todayIndex = dates?.indexOf(parseDate(new Date())) || -1;
      const sliced = dates.slice(todayIndex, numberOfDays);
      const datesToRender = numberOfDays > 1 && todayIndex > -1 ? sliced : dates;
      datesToRender.forEach((day: XDate | string, id: number) => {
        const d = day instanceof XDate ? day : new XDate(day);
        week.push(renderDay(d, id));
      }, this);
    }

    return week;
  };

  return (
    <View style={style.current.container}>
      <View style={[style.current.week, numberOfDays > 1 ? partialWeekStyle : undefined, propsStyle]}>{renderWeek()}</View>
    </View>
  );
}, propsAreEqual);

export default Week;

Week.displayName = 'Week';
