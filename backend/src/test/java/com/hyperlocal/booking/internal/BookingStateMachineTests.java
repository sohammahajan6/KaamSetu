package com.hyperlocal.booking.internal;

import static org.assertj.core.api.Assertions.assertThat;

import com.hyperlocal.events.BookingStatus;
import java.util.stream.Stream;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class BookingStateMachineTests {

    @ParameterizedTest
    @MethodSource("validTransitions")
    void allowValidTransitions(BookingStatus from, BookingStatus to) {
        assertThat(BookingStateMachine.canTransition(from, to)).isTrue();
    }

    @ParameterizedTest
    @MethodSource("invalidTransitions")
    void rejectInvalidTransitions(BookingStatus from, BookingStatus to) {
        assertThat(BookingStateMachine.canTransition(from, to)).isFalse();
    }

    @ParameterizedTest
    @MethodSource("roleGatesProvider")
    void allowProviderActions(BookingStatus target) {
        assertThat(BookingStateMachine.roleMayTrigger(target, false, true)).isTrue();
    }

    @ParameterizedTest
    @MethodSource("roleGatesCustomer")
    void allowCustomerCancelOnly(BookingStatus target) {
        assertThat(BookingStateMachine.roleMayTrigger(target, true, false))
                .isEqualTo(target == BookingStatus.CANCELLED);
    }

    @ParameterizedTest
    @MethodSource("roleGatesNeither")
    void rejectNoRole(BookingStatus target) {
        assertThat(BookingStateMachine.roleMayTrigger(target, false, false)).isFalse();
    }

    static Stream<Arguments> validTransitions() {
        return Stream.of(
                Arguments.of(BookingStatus.REQUESTED, BookingStatus.ACCEPTED),
                Arguments.of(BookingStatus.REQUESTED, BookingStatus.CANCELLED),
                Arguments.of(BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS),
                Arguments.of(BookingStatus.ACCEPTED, BookingStatus.CANCELLED),
                Arguments.of(BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED),
                Arguments.of(BookingStatus.COMPLETED, BookingStatus.RATED));
    }

    static Stream<Arguments> invalidTransitions() {
        return Stream.of(
                Arguments.of(BookingStatus.REQUESTED, BookingStatus.REQUESTED),
                Arguments.of(BookingStatus.IN_PROGRESS, BookingStatus.REQUESTED),
                Arguments.of(BookingStatus.IN_PROGRESS, BookingStatus.ACCEPTED),
                Arguments.of(BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED),
                Arguments.of(BookingStatus.COMPLETED, BookingStatus.ACCEPTED),
                Arguments.of(BookingStatus.COMPLETED, BookingStatus.IN_PROGRESS),
                Arguments.of(BookingStatus.COMPLETED, BookingStatus.CANCELLED),
                Arguments.of(BookingStatus.CANCELLED, BookingStatus.REQUESTED),
                Arguments.of(BookingStatus.CANCELLED, BookingStatus.ACCEPTED),
                Arguments.of(BookingStatus.CANCELLED, BookingStatus.IN_PROGRESS),
                Arguments.of(BookingStatus.RATED, BookingStatus.REQUESTED),
                Arguments.of(BookingStatus.RATED, BookingStatus.COMPLETED));
    }

    static Stream<Arguments> roleGatesProvider() {
        return Stream.of(
                Arguments.of(BookingStatus.ACCEPTED),
                Arguments.of(BookingStatus.IN_PROGRESS),
                Arguments.of(BookingStatus.COMPLETED),
                Arguments.of(BookingStatus.CANCELLED));
    }

    static Stream<Arguments> roleGatesCustomer() {
        return Stream.of(
                Arguments.of(BookingStatus.CANCELLED),
                Arguments.of(BookingStatus.ACCEPTED),
                Arguments.of(BookingStatus.IN_PROGRESS),
                Arguments.of(BookingStatus.COMPLETED));
    }

    static Stream<Arguments> roleGatesNeither() {
        return Stream.of(
                Arguments.of(BookingStatus.ACCEPTED),
                Arguments.of(BookingStatus.IN_PROGRESS),
                Arguments.of(BookingStatus.COMPLETED),
                Arguments.of(BookingStatus.CANCELLED));
    }
}
