while true; do
    read -p "This will destory everything load in copy of test data in your database, and pruge everything in your queue. Are you sure to proceed?[Y/n]" yn
    case $yn in
        [Y]* ) make install; break;;
        [Nn]* ) exit 1;;
        * ) echo "Please answer yes or no.";;
    esac
done
