beginPhase('$digest'); // Check for changes to browser url that happened in sync before the call to $digest
$browser.$$checkUrlChange();

if (this === $rootScope && applyAsyncId !== null) { // If this is the root scope, and $applyAsync has scheduled a
  deferred;
  $apply(), then; // cancel the scheduled $apply and flush the queue of expressions to be evaluated.
  $browser.defer.cancel(applyAsyncId);
  flushApplyAsync();
}
