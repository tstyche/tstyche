status=0

for test in tests/*.test.js; do
  node "$test" || status=1
done

exit $status
