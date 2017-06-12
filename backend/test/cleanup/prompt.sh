while true; do
    echo "This will destroy everything and load a copy of test data in your database and purge everything in your queue."
    read -p "Are you sure to proceed? [DELETE/n] " yn
    case $yn in
        DELETE ) make install; break;;
        [Nn]* ) exit 1;;
        * ) echo "Please answer yes or no.";;
    esac
done
